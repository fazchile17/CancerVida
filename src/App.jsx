import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ChatWindow } from './components/ChatWindow';
import { RiskDashboard } from './components/RiskDashboard';
import { GlobalDashboard } from './components/GlobalDashboard';
import { UserList } from './components/UserList';
import './styles/globals.css';

/**
 * Selector de usuario (pantalla inicial)
 */
function UserSelector() {
  const { currentUser, setCurrentUser, users, loadUsers, loading } = useUser();
  const [showUserList, setShowUserList] = useState(false);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (showUserList) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => setShowUserList(false)}
          className="mb-4 text-primary-600 hover:text-primary-800"
        >
          ← Volver
        </button>
        <UserList />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          CancerVidaBot
        </h1>
        
        {currentUser ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg text-gray-700">Usuario actual:</p>
              <p className="text-xl font-semibold text-primary-600">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowUserList(true)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cambiar Usuario
              </button>
              <button
                onClick={() => setCurrentUser(null)}
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Selecciona un usuario para comenzar
            </p>
            
            {loading ? (
              <div className="text-center py-4">Cargando usuarios...</div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.slice(0, 5).map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => setCurrentUser(user)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay usuarios. Crea uno nuevo.
              </p>
            )}
            
            <button
              onClick={() => setShowUserList(true)}
              className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Gestionar Usuarios
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Componente principal de la aplicación
 */
function AppContent() {
  const { currentUser } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages,
    retryMessage,
    failedMessages
  } = useChat();
  const [showRiskDashboard, setShowRiskDashboard] = useState(false);
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  // Si no hay usuario seleccionado, mostrar selector
  if (!currentUser) {
    return <UserSelector />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header con info del usuario */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2 flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>CancerVidaBot</h1>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            {currentUser.name}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleTheme}
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setShowUserList(true)}
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setShowRiskDashboard(true)}
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            ⚠️ Riesgos
          </button>
          <button
            onClick={() => setShowGlobalDashboard(true)}
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      {/* Ventana de chat */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        error={error}
        retryMessage={retryMessage}
        failedMessages={failedMessages}
      />

      {/* Dashboard de riesgos */}
      <RiskDashboard
        isOpen={showRiskDashboard}
        onClose={() => setShowRiskDashboard(false)}
      />

      {/* Dashboard Global */}
      <GlobalDashboard
        isOpen={showGlobalDashboard}
        onClose={() => setShowGlobalDashboard(false)}
      />

      {/* Lista de usuarios (modal) */}
      {showUserList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
              <button
                onClick={() => setShowUserList(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <UserList />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente raíz con providers
 */
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

