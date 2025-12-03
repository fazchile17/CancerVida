import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  updateLastActive
} from '../services/userService';

/**
 * Contexto global de usuarios
 * Maneja el estado de usuarios y el usuario actual
 */
const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }
  return context;
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuario actual desde localStorage al iniciar
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      loadUser(savedUserId);
    }
  }, []);

  // Cargar todos los usuarios (modo pruebas)
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar un usuario específico
  const loadUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const user = await getUser(userId);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', userId);
        // Actualizar último acceso
        await updateLastActive(userId);
      } else {
        // Usuario no existe, limpiar localStorage
        localStorage.removeItem('currentUserId');
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error cargando usuario:', err);
      setError(err.message);
      setCurrentUser(null);
      localStorage.removeItem('currentUserId');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo usuario
  const handleCreateUser = useCallback(async (email, name, password = null) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await createUser(email, name, password);
      setUsers(prev => [newUser, ...prev]);
      
      // Auto-seleccionar el nuevo usuario
      setCurrentUser(newUser);
      localStorage.setItem('currentUserId', newUser.userId);
      
      return newUser;
    } catch (err) {
      console.error('Error creando usuario:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar usuario
  const handleUpdateUser = useCallback(async (userId, data) => {
    try {
      setLoading(true);
      setError(null);
      await updateUser(userId, data);
      
      // Actualizar estado local
      if (currentUser?.userId === userId) {
        setCurrentUser(prev => ({ ...prev, ...data }));
      }
      
      setUsers(prev => prev.map(user => 
        user.userId === userId ? { ...user, ...data } : user
      ));
    } catch (err) {
      console.error('Error actualizando usuario:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Eliminar usuario
  const handleDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser(userId);
      
      // Si se elimina el usuario actual, limpiar
      if (currentUser?.userId === userId) {
        setCurrentUser(null);
        localStorage.removeItem('currentUserId');
      }
      
      setUsers(prev => prev.filter(user => user.userId !== userId));
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Establecer usuario actual
  const handleSetCurrentUser = useCallback((user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUserId', user.userId);
      updateLastActive(user.userId);
    } else {
      localStorage.removeItem('currentUserId');
    }
  }, []);

  // Cerrar sesión
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  }, []);

  const value = {
    currentUser,
    users,
    loading,
    error,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    setCurrentUser: handleSetCurrentUser,
    loadUser,
    loadUsers,
    logout
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

