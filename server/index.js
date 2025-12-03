/**
 * Servidor Express para OpenRender
 * Backend proxy seguro para OpenAI API
 * 
 * Este servidor actúa como proxy para proteger la API key de OpenAI
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Obtener API key desde variables de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Proxy seguro para OpenAI API
 * 
 * POST /openai-proxy
 * 
 * Body:
 * {
 *   "messages": [...],
 *   "model": "optional-model-name",
 *   "temperature": 0.7,
 *   "max_tokens": 1000
 * }
 */
app.post('/openai-proxy', async (req, res) => {
  try {
    // Validar API key
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no configurada');
      return res.status(500).json({
        error: 'Configuración del servidor incompleta: OPENAI_API_KEY no está configurada'
      });
    }

    // Validar body
    const { messages, model, temperature, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Se requiere un array de mensajes válido'
      });
    }

    // Construir request body para OpenAI
    const requestBody = {
      model: model || DEFAULT_MODEL,
      messages: messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000
    };

    // Hacer request a OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error de OpenAI:', errorData);
      
      return res.status(response.status).json({
        error: errorData.error?.message || 'Error al comunicarse con OpenAI',
        details: errorData
      });
    }

    const data = await response.json();

    // Retornar respuesta
    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error en openai-proxy:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CancerVidaBot API (OpenRender)',
    apiKeyConfigured: !!OPENAI_API_KEY,
    provider: 'OpenAI'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CancerVidaBot API',
    version: '1.0.0',
    provider: 'OpenAI',
    endpoints: {
      health: '/health',
      proxy: '/openai-proxy'
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CancerVidaBot API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 OpenAI API Key configured: ${!!OPENAI_API_KEY}`);
  console.log(`🤖 Provider: OpenAI`);
});

module.exports = app;
