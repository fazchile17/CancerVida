/**
 * Servicio de estadísticas
 * 
 * Obtiene estadísticas globales y por usuario desde Firestore
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAt,
  endAt,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getAllUsers } from './userService';
import { getUserChats } from './chatService';
import { getChatMessages } from './messageService';
import { getRiskLogsFromFirestore } from './riskLog';

/**
 * Obtiene estadísticas de un usuario específico
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Estadísticas del usuario
 */
export async function getUserStats(userId) {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    // Obtener chats del usuario
    const chats = await getUserChats(userId);
    
    // Contar mensajes totales
    let totalMessages = 0;
    for (const chat of chats) {
      try {
        const messages = await getChatMessages(chat.chatId);
        totalMessages += messages.length;
      } catch (err) {
        console.warn(`Error obteniendo mensajes del chat ${chat.chatId}:`, err);
      }
    }

    // Obtener logs de riesgo del usuario
    const riskLogs = await getRiskLogsFromFirestore(userId);

    return {
      userId,
      chatCount: chats.length,
      totalMessages,
      riskEventsCount: riskLogs.length,
      lastActiveAt: chats.length > 0 ? chats[0].updatedAt : null
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas globales
 * 
 * @returns {Promise<Object>} Estadísticas globales
 */
export async function getGlobalStats() {
  try {
    const users = await getAllUsers();
    const allChats = [];
    let totalMessages = 0;
    let totalRiskEvents = 0;

    // Obtener estadísticas de cada usuario
    for (const user of users) {
      try {
        const userStats = await getUserStats(user.userId);
        allChats.push(...(await getUserChats(user.userId)));
        totalMessages += userStats.totalMessages;
        totalRiskEvents += userStats.riskEventsCount;
      } catch (err) {
        console.warn(`Error obteniendo stats del usuario ${user.userId}:`, err);
      }
    }

    return {
      totalUsers: users.length,
      totalChats: allChats.length,
      totalMessages,
      totalRiskEvents,
      activeUsers: users.filter(u => {
        const lastActive = new Date(u.lastActiveAt || u.createdAt);
        const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 7; // Activo en últimos 7 días
      }).length
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas globales:', error);
    throw error;
  }
}

/**
 * Obtiene mensajes agrupados por día
 * 
 * @param {number} days - Número de días hacia atrás
 * @returns {Promise<Array>} Array de { date, count }
 */
export async function getMessagesByDay(days = 30) {
  try {
    const users = await getAllUsers();
    const messagesByDay = {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Inicializar días
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      messagesByDay[dateKey] = 0;
    }

    // Contar mensajes por día
    for (const user of users) {
      const chats = await getUserChats(user.userId);
      for (const chat of chats) {
        try {
          const messages = await getChatMessages(chat.chatId);
          messages.forEach(msg => {
            if (msg.timestamp) {
              const msgDate = new Date(msg.timestamp);
              if (msgDate >= startDate) {
                const dateKey = msgDate.toISOString().split('T')[0];
                if (messagesByDay[dateKey] !== undefined) {
                  messagesByDay[dateKey]++;
                }
              }
            }
          });
        } catch (err) {
          console.warn(`Error procesando mensajes del chat ${chat.chatId}:`, err);
        }
      }
    }

    // Convertir a array
    return Object.entries(messagesByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error obteniendo mensajes por día:', error);
    return [];
  }
}

/**
 * Obtiene usuarios activos
 * 
 * @param {number} days - Días de actividad
 * @returns {Promise<Array>} Array de usuarios activos
 */
export async function getActiveUsers(days = 7) {
  try {
    const users = await getAllUsers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return users.filter(user => {
      const lastActive = new Date(user.lastActiveAt || user.createdAt);
      return lastActive >= cutoffDate;
    });
  } catch (error) {
    console.error('Error obteniendo usuarios activos:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas del RAG
 * 
 * @returns {Promise<Object>} Estadísticas del RAG
 */
export async function getRAGStats() {
  try {
    // Esto es una estructura vacía, pero podemos contar documentos si existen
    // Por ahora, retornamos estructura básica
    return {
      documentsCount: 0,
      embeddingsCount: 0,
      status: 'empty',
      lastUpdate: null
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas RAG:', error);
    return {
      documentsCount: 0,
      embeddingsCount: 0,
      status: 'error',
      lastUpdate: null
    };
  }
}

