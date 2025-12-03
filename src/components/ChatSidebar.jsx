import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';

/**
 * Componente Sidebar con lista de chats
 * Muestra todos los chats del usuario actual
 */
export function ChatSidebar({ isOpen, onClose }) {
  const {
    chats,
    currentChatId,
    isLoadingChats,
    createChat,
    selectChat,
    updateChat,
    deleteChat,
    duplicateChat
  } = useChat();
  const { currentUser } = useUser();
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');

  const handleCreateChat = async () => {
    try {
      const name = newChatName.trim() || 'Nuevo Chat';
      await createChat(name);
      setNewChatName('');
    } catch (error) {
      console.error('Error creando chat:', error);
    }
  };

  const handleEditChat = async (chatId, newName) => {
    try {
      await updateChat(chatId, { name: newName });
      setEditingChatId(null);
    } catch (error) {
      console.error('Error editando chat:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      try {
        await deleteChat(chatId);
      } catch (error) {
        console.error('Error eliminando chat:', error);
        alert('Error al eliminar chat: ' + error.message);
      }
    }
  };

  const handleDuplicateChat = async (chatId) => {
    try {
      await duplicateChat(chatId);
    } catch (error) {
      console.error('Error duplicando chat:', error);
      alert('Error al duplicar chat: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins}m`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-primary-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Chats</h2>
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
          
          {/* Botón crear chat */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateChat()}
              placeholder="Nuevo chat..."
              className="flex-1 px-2 py-1 text-sm text-gray-800 rounded border border-white/30 bg-white/20 placeholder-white/70 focus:outline-none focus:bg-white/30"
            />
            <button
              onClick={handleCreateChat}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
              title="Crear chat"
            >
              +
            </button>
          </div>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Cargando chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay chats. Crea uno nuevo.
            </div>
          ) : (
            <div className="py-2">
              {chats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`
                    px-4 py-3 cursor-pointer hover:bg-gray-50
                    border-l-4 transition-colors group
                    ${currentChatId === chat.chatId 
                      ? 'bg-primary-50 border-primary-500' 
                      : 'border-transparent'
                    }
                  `}
                  onClick={() => {
                    selectChat(chat.chatId);
                    onClose(); // Cerrar en móvil
                  }}
                >
                  {editingChatId === chat.chatId ? (
                    <input
                      type="text"
                      defaultValue={chat.name}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          handleEditChat(chat.chatId, e.target.value.trim());
                        } else {
                          setEditingChatId(null);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                        if (e.key === 'Escape') {
                          setEditingChatId(null);
                        }
                      }}
                      autoFocus
                      className="w-full px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800 truncate">
                          {chat.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(chat.updatedAt)}
                        </div>
                        {chat.messageCount > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {chat.messageCount} mensajes
                          </div>
                        )}
                      </div>
                      
                      {/* Menú de acciones */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat.chatId);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 text-xs"
                          title="Editar nombre"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateChat(chat.chatId);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 text-xs"
                          title="Duplicar"
                        >
                          📋
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.chatId);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 text-xs"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

