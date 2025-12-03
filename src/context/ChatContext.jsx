import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
import { sendMessage, getSystemPrompt } from '../services/llmClient';
import { searchRelevantChunks, initializeRAG } from '../services/ragEngine';
import { evaluateRisk, applyAutoMitigation, shouldBlockResponse } from '../services/iaRMF';
import { logRiskEvent } from '../services/riskLog';
import {
  createChat,
  getUserChats,
  updateChat,
  deleteChat,
  duplicateChat,
  getChat
} from '../services/chatService';
import {
  addMessage as addMessageToFirestore,
  getChatMessages
} from '../services/messageService';
import { getUserGlobalContext } from '../services/userContextService';

/**
 * Contexto global del chat
 * Maneja el estado de los mensajes, chats y la comunicación con el LLM
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
  const { currentUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [error, setError] = useState(null);
  const [isRAGInitialized, setIsRAGInitialized] = useState(false);
  const [failedMessages, setFailedMessages] = useState(new Map()); // Para reintentar

  // Inicializar RAG al montar el componente
  useEffect(() => {
    const init = async () => {
      try {
        await initializeRAG();
        setIsRAGInitialized(true);
      } catch (err) {
        console.error('Error inicializando RAG:', err);
        setIsRAGInitialized(true);
      }
    };
    init();
  }, []);

  // Cargar chats del usuario cuando cambia el usuario
  useEffect(() => {
    if (currentUser?.userId) {
      loadUserChats();
    } else {
      setChats([]);
      setCurrentChatId(null);
      setCurrentChat(null);
      setMessages([]);
    }
  }, [currentUser?.userId]);

  // Cargar mensajes cuando cambia el chat seleccionado
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  /**
   * Carga los chats del usuario actual
   */
  const loadUserChats = useCallback(async () => {
    if (!currentUser?.userId) return;

    try {
      setIsLoadingChats(true);
      const userChats = await getUserChats(currentUser.userId);
      setChats(userChats);

      // Si hay chats pero no hay chat seleccionado, seleccionar el más reciente
      if (userChats.length > 0 && !currentChatId) {
        const mostRecent = userChats[0];
        setCurrentChatId(mostRecent.chatId);
        setCurrentChat(mostRecent);
      }
    } catch (err) {
      console.error('Error cargando chats:', err);
      setError(err.message);
    } finally {
      setIsLoadingChats(false);
    }
  }, [currentUser?.userId, currentChatId]);

  /**
   * Carga los mensajes de un chat
   */
  const loadChatMessages = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      const chatMessages = await getChatMessages(chatId);
      
      // Convertir a formato esperado por el componente
      const formattedMessages = chatMessages.map(msg => ({
        messageId: msg.messageId,
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp,
        userId: msg.userId,
        chatId: msg.chatId
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error cargando mensajes:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo chat
   */
  const handleCreateChat = useCallback(async (name = 'Nuevo Chat') => {
    if (!currentUser?.userId) {
      throw new Error('Debes seleccionar un usuario primero');
    }

    try {
      setIsLoading(true);
      const newChat = await createChat(currentUser.userId, name);
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.chatId);
      setCurrentChat(newChat);
      setMessages([]);
      
      return newChat;
    } catch (err) {
      console.error('Error creando chat:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.userId]);

  /**
   * Selecciona un chat
   */
  const handleSelectChat = useCallback(async (chatId) => {
    try {
      const chat = await getChat(chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setCurrentChat(chat);
      }
    } catch (err) {
      console.error('Error seleccionando chat:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Actualiza un chat (ej: cambiar nombre)
   */
  const handleUpdateChat = useCallback(async (chatId, data) => {
    try {
      await updateChat(chatId, data);
      
      setChats(prev => prev.map(chat => 
        chat.chatId === chatId ? { ...chat, ...data } : chat
      ));
      
      if (currentChatId === chatId) {
        setCurrentChat(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error actualizando chat:', err);
      setError(err.message);
      throw err;
    }
  }, [currentChatId]);

  /**
   * Elimina un chat
   */
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await deleteChat(chatId);
      
      setChats(prev => prev.filter(chat => chat.chatId !== chatId));
      
      // Si se elimina el chat actual, limpiar
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error eliminando chat:', err);
      setError(err.message);
      throw err;
    }
  }, [currentChatId]);

  /**
   * Duplica un chat
   */
  const handleDuplicateChat = useCallback(async (chatId, newName = null) => {
    try {
      setIsLoading(true);
      const newChat = await duplicateChat(chatId, newName);
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.chatId);
      setCurrentChat(newChat);
      
      // Cargar mensajes del nuevo chat
      await loadChatMessages(newChat.chatId);
      
      return newChat;
    } catch (err) {
      console.error('Error duplicando chat:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Envía un mensaje del usuario y obtiene respuesta del bot
   * 
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} messageId - ID del mensaje a reintentar (opcional)
   */
  const handleSendMessage = useCallback(async (userMessage, messageId = null) => {
    if (!userMessage.trim()) return;
    
    if (!currentUser?.userId) {
      setError('Debes seleccionar un usuario primero');
      return;
    }

    if (!currentChatId) {
      // Crear chat automáticamente si no hay uno seleccionado
      try {
        const newChat = await handleCreateChat('Nuevo Chat');
        setCurrentChatId(newChat.chatId);
        setCurrentChat(newChat);
      } catch (err) {
        setError('Error al crear chat: ' + err.message);
        return;
      }
    }

    // Crear mensaje del usuario
    const userMsg = {
      text: userMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
      userId: currentUser.userId,
      chatId: currentChatId
    };

    // Si es un reintento, eliminar el mensaje fallido anterior
    if (messageId) {
      setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
      setFailedMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(messageId);
        return newMap;
      });
    }

    // Añadir mensaje localmente
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Guardar mensaje del usuario en Firestore
      let savedUserMsg;
      try {
        savedUserMsg = await addMessageToFirestore(currentChatId, {
          text: userMessage,
          isUser: true,
          userId: currentUser.userId
        });
        // Actualizar mensaje local con ID real
        setMessages(prev => prev.map(msg => 
          msg === userMsg ? { ...msg, messageId: savedUserMsg.messageId } : msg
        ));
      } catch (saveError) {
        console.error('Error guardando mensaje del usuario:', saveError);
        // Continuar aunque falle el guardado
      }

      // 1. Buscar chunks relevantes del RAG
      let contextChunks = [];
      if (isRAGInitialized) {
        try {
          contextChunks = searchRelevantChunks(userMessage, 3);
          console.log('RAG chunks encontrados:', contextChunks.length);
        } catch (ragError) {
          console.warn('Error en búsqueda RAG:', ragError);
        }
      }

      // 2. Obtener contexto global del usuario (otros chats)
      let globalContext = [];
      try {
        globalContext = await getUserGlobalContext(
          currentUser.userId,
          currentChatId,
          3, // maxChats
          5  // maxMessagesPerChat
        );
        console.log('Contexto global obtenido:', globalContext.length, 'mensajes');
      } catch (globalError) {
        console.warn('Error obteniendo contexto global:', globalError);
        // Continuar sin contexto global
      }

      // 3. Obtener prompt del sistema
      const systemPrompt = getSystemPrompt();

      // 4. Enviar mensaje al LLM
      let llmResponse = '';
      try {
        llmResponse = await sendMessage(
          systemPrompt,
          userMessage,
          contextChunks.map(chunk => chunk.text || chunk),
          globalContext.map(ctx => ({
            text: ctx.text,
            chatName: ctx.chatName
          }))
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
          finalResponse,
          userId: currentUser.userId,
          chatId: currentChatId
        });
      } catch (logError) {
        console.error('Error registrando evento de riesgo:', logError);
      }

      // 7. Crear mensaje del bot
      const botMsg = {
        text: finalResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        userId: currentUser.userId,
        chatId: currentChatId
      };

      // Añadir mensaje localmente
      setMessages(prev => [...prev, botMsg]);

      // Guardar mensaje del bot en Firestore
      try {
        await addMessageToFirestore(currentChatId, {
          text: finalResponse,
          isUser: false,
          userId: currentUser.userId
        });
      } catch (saveError) {
        console.error('Error guardando mensaje del bot:', saveError);
        // No es crítico, el mensaje ya está en la UI
      }

    } catch (err) {
      console.error('Error en handleSendMessage:', err);
      setError(err.message || 'Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.');
      
      // Guardar mensaje fallido para poder reintentarlo
      const failedMsg = {
        ...userMsg,
        error: err.message,
        canRetry: true
      };
      setFailedMessages(prev => new Map(prev).set(userMsg.timestamp, failedMsg));
      
      // Agregar mensaje de error al chat
      const errorMsg = {
        text: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo más tarde.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
        error: err.message
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.userId, currentChatId, isRAGInitialized, handleCreateChat]);

  /**
   * Reintenta un mensaje fallido
   */
  const retryMessage = useCallback(async (messageId) => {
    const failedMsg = failedMessages.get(messageId);
    if (failedMsg && failedMsg.canRetry) {
      await handleSendMessage(failedMsg.text, messageId);
    }
  }, [failedMessages, handleSendMessage]);

  /**
   * Limpia el historial de mensajes del chat actual
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const value = {
    // Mensajes
    messages,
    isLoading,
    error,
    sendMessage: handleSendMessage,
    clearMessages,
    retryMessage,
    failedMessages: Array.from(failedMessages.values()),
    
    // Chats
    chats,
    currentChatId,
    currentChat,
    isLoadingChats,
    createChat: handleCreateChat,
    selectChat: handleSelectChat,
    updateChat: handleUpdateChat,
    deleteChat: handleDeleteChat,
    duplicateChat: handleDuplicateChat,
    loadChats: loadUserChats
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
