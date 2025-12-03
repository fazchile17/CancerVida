/**
 * Servicio de gestión de mensajes
 * 
 * Maneja el almacenamiento de mensajes en Firestore
 * Los mensajes se almacenan como subcollection dentro de cada chat
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { incrementMessageCount } from './chatService';

const CHATS_COLLECTION = 'chats';

/**
 * Añade un mensaje a un chat
 * 
 * @param {string} chatId - ID del chat
 * @param {Object} message - Datos del mensaje
 * @param {string} message.text - Texto del mensaje
 * @param {boolean} message.isUser - Si es mensaje del usuario
 * @param {string} message.userId - ID del usuario
 * @param {string} message.timestamp - Timestamp (opcional, se genera si no se proporciona)
 * @returns {Promise<Object>} Mensaje creado con ID
 */
export async function addMessage(chatId, message) {
  try {
    if (!chatId) {
      throw new Error('chatId es requerido');
    }

    if (!message.text) {
      throw new Error('El texto del mensaje es requerido');
    }

    const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    
    const messageData = {
      text: message.text.trim(),
      isUser: message.isUser || false,
      userId: message.userId || '',
      chatId: chatId,
      timestamp: message.timestamp || serverTimestamp()
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Incrementar contador de mensajes del chat
    await incrementMessageCount(chatId);

    return {
      messageId: docRef.id,
      ...messageData,
      timestamp: message.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error añadiendo mensaje:', error);
    throw new Error(`Error al añadir mensaje: ${error.message}`);
  }
}

/**
 * Obtiene todos los mensajes de un chat
 * 
 * @param {string} chatId - ID del chat
 * @param {number} maxMessages - Número máximo de mensajes (opcional)
 * @returns {Promise<Array>} Lista de mensajes ordenados por timestamp
 */
export async function getChatMessages(chatId, maxMessages = null) {
  try {
    if (!chatId) {
      throw new Error('chatId es requerido');
    }

    const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    let q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    if (maxMessages) {
      q = query(messagesRef, orderBy('timestamp', 'asc'), limit(maxMessages));
    }

    const querySnapshot = await getDocs(q);

    const messages = [];
    querySnapshot.forEach((doc) => {
      const messageData = doc.data();
      messages.push({
        messageId: doc.id,
        ...messageData,
        timestamp: messageData.timestamp?.toDate?.()?.toISOString() || messageData.timestamp
      });
    });

    return messages;
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    throw new Error(`Error al obtener mensajes: ${error.message}`);
  }
}

/**
 * Elimina un mensaje
 * 
 * @param {string} chatId - ID del chat
 * @param {string} messageId - ID del mensaje
 * @returns {Promise<void>}
 */
export async function deleteMessage(chatId, messageId) {
  try {
    if (!chatId || !messageId) {
      throw new Error('chatId y messageId son requeridos');
    }

    const messageRef = doc(db, CHATS_COLLECTION, chatId, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    throw new Error(`Error al eliminar mensaje: ${error.message}`);
  }
}

/**
 * Obtiene el último mensaje de un chat (para preview)
 * 
 * @param {string} chatId - ID del chat
 * @returns {Promise<Object|null>} Último mensaje o null
 */
export async function getLastMessage(chatId) {
  try {
    if (!chatId) {
      return null;
    }

    const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const messageData = doc.data();
    
    return {
      messageId: doc.id,
      ...messageData,
      timestamp: messageData.timestamp?.toDate?.()?.toISOString() || messageData.timestamp
    };
  } catch (error) {
    console.error('Error obteniendo último mensaje:', error);
    return null;
  }
}

