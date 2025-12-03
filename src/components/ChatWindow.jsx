import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingDots } from './LoadingDots';
import { InputBox } from './InputBox';
import { ChatSidebar } from './ChatSidebar';
import { useChat } from '../context/ChatContext';

/**
 * Componente principal de la ventana de chat
 * Maneja la visualización de mensajes, sidebar y scroll automático
 */
export function ChatWindow({ messages, isLoading, onSendMessage, error, retryMessage, failedMessages = [] }) {
  const { currentChat } = useChat();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-primary-600 text-white px-4 py-3 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botón toggle sidebar (móvil) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:text-gray-200 p-1"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-lg font-semibold">
                {currentChat?.name || 'CancerVidaBot'}
              </h1>
              <p className="text-xs text-primary-100">Asistente emocional de apoyo</p>
            </div>
          </div>
        </div>

        {/* Área de mensajes */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide bg-white"
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">👋 Hola, soy CancerVidaBot</p>
                <p className="text-sm">
                  Estoy aquí para brindarte apoyo emocional.
                </p>
                <p className="text-sm mt-2">
                  ¿En qué puedo ayudarte hoy?
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.messageId || index}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
              isError={msg.isError}
              messageId={msg.messageId || msg.timestamp}
              onRetry={retryMessage}
            />
          ))}

          {isLoading && <LoadingDots />}

          {/* Mensaje de error general */}
          {error && (
            <div className="flex justify-center mb-4 px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-[80%]">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <InputBox
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder="Escribe tu mensaje..."
        />
      </div>
    </div>
  );
}
