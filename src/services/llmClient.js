/**
 * Cliente LLM para comunicación con OpenAI
 * Maneja la comunicación con modelos de lenguaje vía OpenAI API
 * 
 * IMPORTANTE: La API key debe estar en variables de entorno
 * No exponer nunca la clave en el código del cliente
 * 
 * Soporta dos modos:
 * 1. Directo: Llama a OpenAI desde el cliente (requiere API key en .env)
 * 2. Proxy: Usa OpenRender como proxy seguro (recomendado para producción)
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini'; // Modelo por defecto

/**
 * Determina si debe usarse el backend proxy
 * 
 * @returns {boolean} true si debe usarse el proxy
 */
function shouldUseProxy() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  return !!backendUrl && backendUrl.trim() !== '';
}

/**
 * Envía un mensaje al LLM a través de OpenAI (directo o vía proxy)
 * 
 * @param {string} systemPrompt - Prompt del sistema que define el comportamiento del bot
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} contextChunks - Chunks relevantes del RAG (opcional)
 * @param {Array} globalContext - Contexto global del usuario (otros chats) (opcional)
 * @param {Function} onStream - Callback para respuestas en streaming (opcional)
 * @returns {Promise<string>} Respuesta del LLM
 */
export async function sendMessage(systemPrompt, userMessage, contextChunks = [], globalContext = [], onStream = null) {
  // Usar proxy si está configurado, sino usar llamada directa
  if (shouldUseProxy()) {
    return sendMessageViaProxy(systemPrompt, userMessage, contextChunks, globalContext, onStream);
  } else {
    return sendMessageDirect(systemPrompt, userMessage, contextChunks, globalContext, onStream);
  }
}

/**
 * Envía mensaje vía backend proxy (OpenRender)
 * 
 * @param {string} systemPrompt - Prompt del sistema
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} contextChunks - Chunks del RAG
 * @param {Function} onStream - Callback para streaming
 * @returns {Promise<string>} Respuesta del LLM
 */
async function sendMessageViaProxy(systemPrompt, userMessage, contextChunks = [], globalContext = [], onStream = null) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL no está configurada');
  }

  // Construir el contexto del RAG si hay chunks disponibles
  let contextText = '';
  if (contextChunks && contextChunks.length > 0) {
    contextText = '\n\nContexto relevante (RAG):\n' + contextChunks.map(chunk => `- ${chunk.text || chunk}`).join('\n');
  }

  // Construir contexto global del usuario si está disponible
  let globalContextText = '';
  if (globalContext && globalContext.length > 0) {
    globalContextText = '\n\nContexto de conversaciones anteriores:\n' + 
      globalContext.map(ctx => `[${ctx.chatName || 'Chat anterior'}]: ${ctx.text}`).join('\n');
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userMessage + contextText + globalContextText
    }
  ];

  const requestBody = {
    model: import.meta.env.VITE_OPENAI_MODEL || DEFAULT_MODEL,
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000
  };

  try {
    const proxyUrl = `${backendUrl}/openai-proxy`;
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || 
        `Error en el proxy: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Respuesta inválida del proxy');
    }

    return data.data.choices[0]?.message?.content || 'No se recibió respuesta del modelo.';

  } catch (error) {
    throw new Error(`Error al comunicarse con el proxy: ${error.message}`);
  }
}

/**
 * Envía mensaje directamente a OpenAI (requiere API key en cliente)
 * 
 * @param {string} systemPrompt - Prompt del sistema
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} contextChunks - Chunks del RAG
 * @param {Function} onStream - Callback para streaming
 * @returns {Promise<string>} Respuesta del LLM
 */
async function sendMessageDirect(systemPrompt, userMessage, contextChunks = [], globalContext = [], onStream = null) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY no está configurada en las variables de entorno');
  }

  // Construir el contexto del RAG si hay chunks disponibles
  let contextText = '';
  if (contextChunks && contextChunks.length > 0) {
    contextText = '\n\nContexto relevante (RAG):\n' + contextChunks.map(chunk => `- ${chunk.text || chunk}`).join('\n');
  }

  // Construir contexto global del usuario si está disponible
  let globalContextText = '';
  if (globalContext && globalContext.length > 0) {
    globalContextText = '\n\nContexto de conversaciones anteriores:\n' + 
      globalContext.map(ctx => `[${ctx.chatName || 'Chat anterior'}]: ${ctx.text}`).join('\n');
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userMessage + contextText + globalContextText
    }
  ];

  const requestBody = {
    model: import.meta.env.VITE_OPENAI_MODEL || DEFAULT_MODEL,
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000,
    stream: !!onStream
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Error en la API: ${response.status} ${response.statusText}`
      );
    }

    // Si hay streaming, procesar el stream
    if (onStream && response.body) {
      return await handleStreamResponse(response, onStream);
    }

    // Respuesta normal
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No se recibió respuesta del modelo.';

  } catch (error) {
    // Manejo de errores específicos
    if (error.name === 'AbortError') {
      throw new Error('La solicitud fue cancelada por timeout');
    }
    
    if (error.message.includes('API key') || error.message.includes('401')) {
      throw new Error('Error de autenticación. Verifica tu API key de OpenAI.');
    }

    throw new Error(`Error al comunicarse con OpenAI: ${error.message}`);
  }
}

/**
 * Maneja respuestas en streaming del LLM
 * 
 * @param {Response} response - Respuesta fetch con stream
 * @param {Function} onChunk - Callback para cada chunk recibido
 * @returns {Promise<string>} Texto completo acumulado
 */
async function handleStreamResponse(response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return fullText;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch (e) {
            // Ignorar líneas que no son JSON válido
            console.warn('Error parsing stream chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}

/**
 * Obtiene el prompt del sistema base
 * NOTA: El contenido emocional real será añadido manualmente
 * 
 * @returns {string} Prompt del sistema
 */
export function getSystemPrompt() {
  return `
You are CancerVidaBot, an emotional support assistant...

// TODO: El contenido emocional completo será añadido manualmente
// Este es solo el armazón del prompt

Guidelines:
- Be empathetic and supportive
- Avoid medical diagnoses or treatment recommendations
- Focus on emotional support
- Use a warm, caring tone
`.trim();
}
