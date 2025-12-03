/**
 * Firebase Cloud Functions para CancerVidaBot
 * 
 * Proporciona un proxy seguro para OpenRouter API
 * Evita exponer la API key en el cliente
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Inicializar Firebase Admin (solo si no está ya inicializado)
if (!admin.apps.length) {
  admin.initializeApp();
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

/**
 * Proxy seguro para OpenRouter API
 * 
 * Endpoint: POST /openrouter-proxy
 * 
 * Body esperado:
 * {
 *   "messages": [...],
 *   "model": "optional-model-name",
 *   "temperature": 0.7,
 *   "max_tokens": 1000
 * }
 */
exports.openrouterProxy = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // Solo permitir POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      // Obtener API key desde variables de entorno de Firebase
      const apiKey = functions.config().openrouter?.api_key;

      if (!apiKey) {
        console.error('OPENROUTER_API_KEY no configurada en Firebase Functions');
        return res.status(500).json({
          error: 'Configuración del servidor incompleta'
        });
      }

      // Validar body
      const { messages, model, temperature, max_tokens } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: 'Se requiere un array de mensajes válido'
        });
      }

      // Construir request body para OpenRouter
      const requestBody = {
        model: model || DEFAULT_MODEL,
        messages: messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000
      };

      // Hacer request a OpenRouter
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': req.headers.origin || 'https://cancervida-bot.web.app',
          'X-Title': 'CancerVidaBot'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error de OpenRouter:', errorData);
        
        return res.status(response.status).json({
          error: errorData.error?.message || 'Error al comunicarse con OpenRouter',
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
      console.error('Error en openrouterProxy:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
});

/**
 * Health check endpoint
 */
exports.health = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CancerVidaBot Functions'
    });
  });
});

