import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

/**
 * Componente de perfil de usuario
 * Permite crear y editar usuarios
 */
export function UserProfile({ userId = null, onSave, onCancel }) {
  const { createUser, updateUser, getUser, loading } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Cargar datos del usuario si se está editando
  useEffect(() => {
    if (userId) {
      loadUserData();
      setIsEditing(true);
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const user = await getUser(userId);
      if (user) {
        setFormData({
          email: user.email || '',
          name: user.name || '',
          password: '' // No cargar password por seguridad
        });
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditing) {
        const updateData = {
          email: formData.email.trim(),
          name: formData.name.trim()
        };
        
        // Solo actualizar password si se proporciona uno nuevo
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateUser(userId, updateData);
      } else {
        await createUser(
          formData.email.trim(),
          formData.name.trim(),
          formData.password || null
        );
      }

      // Limpiar formulario
      setFormData({ email: '', name: '', password: '' });
      setErrors({});
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      setErrors({ submit: error.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="usuario@ejemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre completo"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password {isEditing && '(dejar vacío para no cambiar)'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={isEditing ? 'Nuevo password (opcional)' : 'Password (opcional)'}
          />
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Usuario'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

