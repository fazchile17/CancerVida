/**
 * Servicio de gestión de chats
 * 
 * Maneja CRUD de chats en Firestore
 * Cada usuario puede tener múltiples chats
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  increment
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getChatMessages, addMessage } from './messageService';

const CHATS_COLLECTION = 'chats';

/**
 * Crea un nuevo chat
 * 
 * @param {string} userId - ID del usuario propietario
 * @param {string} name - Nombre del chat
 * @returns {Promise<Object>} Chat creado con ID
 */
export async function createChat(userId, name = 'Nuevo Chat') {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    // Crear referencia al documento (Firestore genera el ID)
    const chatRef = doc(collection(db, CHATS_COLLECTION));
    const chatId = chatRef.id;

    const chatData = {
      chatId,
      userId,
      name: name.trim() || 'Nuevo Chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messageCount: 0
    };

    await setDoc(chatRef, chatData);

    return {
      ...chatData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creando chat:', error);
    throw new Error(`Error al crear chat: ${error.message}`);
  }
}

/**
 * Obtiene un chat por ID
 * 
 * @param {string} chatId - ID del chat
 * @returns {Promise<Object|null>} Chat o null si no existe
 */
export async function getChat(chatId) {
  try {
    if (!chatId) {
      throw new Error('chatId es requerido');
    }

    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      return null;
    }

    const chatData = chatSnap.data();
    
    // Convertir timestamps a ISO strings
    return {
      ...chatData,
      createdAt: chatData.createdAt?.toDate?.()?.toISOString() || chatData.createdAt,
      updatedAt: chatData.updatedAt?.toDate?.()?.toISOString() || chatData.updatedAt
    };
  } catch (error) {
    console.error('Error obteniendo chat:', error);
    throw new Error(`Error al obtener chat: ${error.message}`);
  }
}

/**
 * Actualiza un chat
 * 
 * @param {string} chatId - ID del chat
 * @param {Object} data - Datos a actualizar (name, etc.)
 * @returns {Promise<void>}
 */
export async function updateChat(chatId, data) {
  try {
    if (!chatId) {
      throw new Error('chatId es requerido');
    }

    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };

    await updateDoc(chatRef, updateData);
  } catch (error) {
    console.error('Error actualizando chat:', error);
    throw new Error(`Error al actualizar chat: ${error.message}`);
  }
}

/**
 * Elimina un chat y todos sus mensajes
 * 
 * @param {string} chatId - ID del chat
 * @returns {Promise<void>}
 */
export async function deleteChat(chatId) {
  try {
    if (!chatId) {
      throw new Error('chatId es requerido');
    }

    // Obtener todos los mensajes del chat para eliminarlos
    const messages = await getChatMessages(chatId);
    
    // Eliminar mensajes (si hay servicio para esto)
    // Por ahora, Firestore eliminará la subcollection automáticamente
    // o necesitamos eliminarlos manualmente
    
    // Eliminar el chat
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error('Error eliminando chat:', error);
    throw new Error(`Error al eliminar chat: ${error.message}`);
  }
}

/**
 * Duplica un chat con todos sus mensajes
 * 
 * @param {string} chatId - ID del chat a duplicar
 * @param {string} newName - Nombre del nuevo chat
 * @returns {Promise<Object>} Nuevo chat creado
 */
export async function duplicateChat(chatId, newName = null) {
  try {
    if (!chatId) {
      throw new Error('chatId es requerido');
    }

    // Obtener chat original
    const originalChat = await getChat(chatId);
    if (!originalChat) {
      throw new Error('Chat no encontrado');
    }

    // Obtener mensajes del chat original
    const messages = await getChatMessages(chatId);

    // Crear nuevo chat
    const newChatName = newName || `${originalChat.name} (copia)`;
    const newChat = await createChat(originalChat.userId, newChatName);

    // Copiar mensajes al nuevo chat
    for (const message of messages) {
      await addMessage(newChat.chatId, {
        text: message.text,
        isUser: message.isUser,
        userId: message.userId,
        timestamp: message.timestamp
      });
    }

    return newChat;
  } catch (error) {
    console.error('Error duplicando chat:', error);
    throw new Error(`Error al duplicar chat: ${error.message}`);
  }
}

/**
 * Obtiene todos los chats de un usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de chats del usuario
 */
export async function getUserChats(userId) {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    const chatsRef = collection(db, CHATS_COLLECTION);
    const q = query(
      chatsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    const chats = [];
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      chats.push({
        ...chatData,
        createdAt: chatData.createdAt?.toDate?.()?.toISOString() || chatData.createdAt,
        updatedAt: chatData.updatedAt?.toDate?.()?.toISOString() || chatData.updatedAt
      });
    });

    return chats;
  } catch (error) {
    console.error('Error obteniendo chats del usuario:', error);
    throw new Error(`Error al obtener chats: ${error.message}`);
  }
}

/**
 * Incrementa el contador de mensajes del chat
 * 
 * @param {string} chatId - ID del chat
 * @returns {Promise<void>}
 */
export async function incrementMessageCount(chatId) {
  try {
    if (!chatId) return;
    
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      messageCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementando contador de mensajes:', error);
    // No lanzar error, es una operación no crítica
  }
}

