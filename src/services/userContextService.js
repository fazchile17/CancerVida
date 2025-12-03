/**
 * Servicio para obtener contexto global del usuario
 * 
 * Obtiene mensajes de otros chats del usuario para proporcionar contexto a la IA
 */

import { getUserChats } from './chatService';
import { getChatMessages } from './messageService';

/**
 * Obtiene contexto global del usuario desde otros chats
 * 
 * @param {string} userId - ID del usuario
 * @param {string} excludeChatId - ID del chat a excluir (chat actual)
 * @param {number} maxChats - Número máximo de chats a considerar
 * @param {number} maxMessagesPerChat - Número máximo de mensajes por chat
 * @returns {Promise<Array>} Array de mensajes de contexto con información del chat
 */
export async function getUserGlobalContext(userId, excludeChatId = null, maxChats = 3, maxMessagesPerChat = 5) {
  try {
    if (!userId) {
      return [];
    }

    // Obtener todos los chats del usuario
    const allChats = await getUserChats(userId);
    
    // Filtrar el chat actual y ordenar por fecha de actualización
    const otherChats = allChats
      .filter(chat => chat.chatId !== excludeChatId)
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      })
      .slice(0, maxChats);

    // Obtener mensajes de cada chat
    const contextMessages = [];
    for (const chat of otherChats) {
      try {
        const messages = await getChatMessages(chat.chatId, maxMessagesPerChat);
        
        // Añadir información del chat a cada mensaje
        messages.forEach(msg => {
          contextMessages.push({
            ...msg,
            chatName: chat.name,
            chatId: chat.chatId
          });
        });
      } catch (error) {
        console.warn(`Error obteniendo mensajes del chat ${chat.chatId}:`, error);
        // Continuar con otros chats
      }
    }

    // Ordenar por timestamp (más recientes primero)
    contextMessages.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

    return contextMessages;
  } catch (error) {
    console.error('Error obteniendo contexto global del usuario:', error);
    return [];
  }
}

