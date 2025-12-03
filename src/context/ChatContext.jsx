import React, { createContext, useContext, useState, useCallback } from 'react';
import { sendMessage, getSystemPrompt } from '../services/llmClient';
import { searchRelevantChunks, initializeRAG } from '../services/ragEngine';
import { evaluateRisk, applyAutoMitigation, shouldBlockResponse } from '../services/iaRMF';
import { logRiskEvent } from '../services/riskLog';

/**
 * Contexto global del chat
 * Maneja el estado de los mensajes y la comunicación con el LLM
 */
const ChatContext = createContext();

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRAGInitialized, setIsRAGInitialized] = useState(false);

  // Inicializar RAG al montar el componente
  React.useEffect(() => {
    const init = async () => {
      try {
        await initializeRAG();
        setIsRAGInitialized(true);
      } catch (err) {
        console.error('Error inicializando RAG:', err);
        // Continuar sin RAG si falla
        setIsRAGInitialized(true);
      }
    };
    init();
  }, []);

  /**
   * Envía un mensaje del usuario y obtiene respuesta del bot
   * 
   * @param {string} userMessage - Mensaje del usuario
   */
  const handleSendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMsg = {
      text: userMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar chunks relevantes del RAG
      let contextChunks = [];
      if (isRAGInitialized) {
        try {
          contextChunks = searchRelevantChunks(userMessage, 3);
          console.log('RAG chunks encontrados:', contextChunks.length);
        } catch (ragError) {
          console.warn('Error en búsqueda RAG:', ragError);
          // Continuar sin contexto RAG
        }
      }

      // 2. Obtener prompt del sistema
      const systemPrompt = getSystemPrompt();

      // 3. Enviar mensaje al LLM
      let llmResponse = '';
      try {
        llmResponse = await sendMessage(
          systemPrompt,
          userMessage,
          contextChunks.map(chunk => chunk.text || chunk)
        );
      } catch (llmError) {
        throw new Error(`Error al comunicarse con el LLM: ${llmError.message}`);
      }

      // 4. Evaluar riesgo con IA-RMF
      const riskAssessment = evaluateRisk(userMessage, llmResponse, contextChunks);
      
      // 5. Aplicar mitigación automática si es necesario
      let finalResponse = llmResponse;
      const wasBlocked = shouldBlockResponse(riskAssessment);
      
      if (wasBlocked) {
        finalResponse = applyAutoMitigation(llmResponse, riskAssessment);
        console.warn('Respuesta bloqueada por alto riesgo. Usando fallback seguro.');
      }

      // 6. Registrar evento de riesgo
      try {
        logRiskEvent({
          userMessage,
          llmResponse,
          riskLevel: riskAssessment.riskLevel,
          issues: riskAssessment.issues,
          riskScore: riskAssessment.riskScore,
          wasBlocked,
          finalResponse
        });
      } catch (logError) {
        console.error('Error registrando evento de riesgo:', logError);
        // No interrumpir el flujo si falla el logging
      }

      // 7. Agregar respuesta del bot
      const botMsg = {
        text: finalResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error('Error en handleSendMessage:', err);
      setError(err.message || 'Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.');
      
      // Agregar mensaje de error al chat
      const errorMsg = {
        text: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo más tarde.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isRAGInitialized]);

  /**
   * Limpia el historial de mensajes
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const value = {
    messages,
    isLoading,
    error,
    sendMessage: handleSendMessage,
    clearMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

