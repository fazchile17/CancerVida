import React from 'react';

/**
 * Componente de burbuja de mensaje
 * Muestra mensajes del usuario y del bot con estilos diferenciados
 */
export function MessageBubble({ message, isUser, timestamp, isError, onRetry, messageId }) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}
    >
      <div
        className={`message-bubble ${
          isUser ? 'message-user' : 'message-bot'
        } ${isError ? 'bg-red-50 border border-red-200' : ''}`}
      >
        <p className={`text-sm whitespace-pre-wrap ${isError ? 'text-red-700' : ''}`}>
          {message}
        </p>
        {timestamp && (
          <span
            className={`text-xs mt-1 block ${
              isUser ? 'text-primary-100' : 'text-gray-500'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
        {isError && onRetry && (
          <button
            onClick={() => onRetry(messageId)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

