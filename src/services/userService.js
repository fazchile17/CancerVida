/**
 * Servicio de gestión de usuarios
 * 
 * Maneja CRUD de usuarios en Firestore
 * Sin autenticación (modo pruebas)
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
  orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const USERS_COLLECTION = 'users';

/**
 * Crea un nuevo usuario
 * 
 * @param {string} email - Email del usuario (obligatorio)
 * @param {string} name - Nombre del usuario (obligatorio)
 * @param {string} password - Password opcional
 * @returns {Promise<Object>} Usuario creado con ID
 */
export async function createUser(email, name, password = null) {
  try {
    if (!email || !name) {
      throw new Error('Email y nombre son obligatorios');
    }

    // Crear referencia al documento (Firestore genera el ID)
    const userRef = doc(collection(db, USERS_COLLECTION));
    const userId = userRef.id;

    const userData = {
      userId,
      email: email.trim(),
      name: name.trim(),
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    };

    // Añadir password si se proporciona
    if (password) {
      userData.password = password; // En producción, hashear esto
    }

    await setDoc(userRef, userData);

    return {
      ...userData,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
}

/**
 * Obtiene un usuario por ID
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Usuario o null si no existe
 */
export async function getUser(userId) {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();
    
    // Convertir timestamps a ISO strings
    return {
      ...userData,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
      lastActiveAt: userData.lastActiveAt?.toDate?.()?.toISOString() || userData.lastActiveAt
    };
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw new Error(`Error al obtener usuario: ${error.message}`);
  }
}

/**
 * Actualiza un usuario
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} data - Datos a actualizar (name, email, etc.)
 * @returns {Promise<void>}
 */
export async function updateUser(userId, data) {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    const updateData = { ...data };

    // Actualizar lastActiveAt
    updateData.lastActiveAt = serverTimestamp();

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw new Error(`Error al actualizar usuario: ${error.message}`);
  }
}

/**
 * Elimina un usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw new Error(`Error al eliminar usuario: ${error.message}`);
  }
}

/**
 * Obtiene todos los usuarios (modo pruebas)
 * 
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getAllUsers() {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        ...userData,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
        lastActiveAt: userData.lastActiveAt?.toDate?.()?.toISOString() || userData.lastActiveAt
      });
    });

    return users;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw new Error(`Error al obtener usuarios: ${error.message}`);
  }
}

/**
 * Actualiza el último acceso del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<void>}
 */
export async function updateLastActive(userId) {
  try {
    if (!userId) return;
    
    await updateUser(userId, {
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando último acceso:', error);
    // No lanzar error, es una operación no crítica
  }
}

