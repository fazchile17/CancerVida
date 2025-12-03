import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { ChatWindow } from './components/ChatWindow';
import { RiskDashboard } from './components/RiskDashboard';
import './styles/globals.css';

/**
 * Componente principal de la aplicación
 */
function AppContent() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [showRiskDashboard, setShowRiskDashboard] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botón flotante para dashboard de riesgos (modo admin) */}
      <button
        onClick={() => setShowRiskDashboard(true)}
        className="fixed bottom-20 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors z-40 text-sm"
        title="Dashboard de Riesgos (Admin)"
      >
        ⚠️ Riesgos
      </button>

      {/* Botón para limpiar chat */}
      {messages.length > 0 && (
        <button
          onClick={clearMessages}
          className="fixed bottom-20 right-32 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-500 transition-colors z-40 text-sm"
          title="Limpiar chat"
        >
          🗑️ Limpiar
        </button>
      )}

      {/* Ventana de chat */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        error={error}
      />

      {/* Dashboard de riesgos */}
      <RiskDashboard
        isOpen={showRiskDashboard}
        onClose={() => setShowRiskDashboard(false)}
      />
    </div>
  );
}

/**
 * Componente raíz con providers
 */
function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;

