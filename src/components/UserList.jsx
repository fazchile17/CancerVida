import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { UserProfile } from './UserProfile';

/**
 * Componente de lista de usuarios
 * Muestra todos los usuarios (modo pruebas)
 */
export function UserList() {
  const { users, loadUsers, deleteUser, setCurrentUser, loading, currentUser } = useUser();
  const [editingUserId, setEditingUserId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        alert('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const handleEdit = (userId) => {
    setEditingUserId(userId);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    setShowCreateForm(true);
    setEditingUserId(null);
  };

  const handleSave = () => {
    setEditingUserId(null);
    setShowCreateForm(false);
    loadUsers();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
        <button
          onClick={handleCreate}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          + Crear Usuario
        </button>
      </div>

      {/* Formulario de crear/editar */}
      {(showCreateForm || editingUserId) && (
        <UserProfile
          userId={editingUserId}
          onSave={handleSave}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingUserId(null);
          }}
        />
      )}

      {/* Lista de usuarios */}
      {loading && users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay usuarios. Crea el primero.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.userId}
                  className={currentUser?.userId === user.userId ? 'bg-primary-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      {currentUser?.userId === user.userId && (
                        <span className="ml-2 px-2 py-1 text-xs bg-primary-500 text-white rounded">
                          Activo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(user.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(user.lastActiveAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentUser(user)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Usar
                      </button>
                      <button
                        onClick={() => handleEdit(user.userId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

