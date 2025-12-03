import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingDots } from './LoadingDots';
import { InputBox } from './InputBox';

/**
 * Componente principal de la ventana de chat
 * Maneja la visualización de mensajes y el scroll automático
 */
export function ChatWindow({ messages, isLoading, onSendMessage, error }) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 py-4 shadow-md">
        <h1 className="text-xl font-semibold">CancerVidaBot</h1>
        <p className="text-sm text-primary-100">Asistente emocional de apoyo</p>
      </div>

      {/* Área de mensajes */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide"
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
            key={index}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}

        {isLoading && <LoadingDots />}

        {/* Mensaje de error */}
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
  );
}

