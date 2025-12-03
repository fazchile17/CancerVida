import React from 'react';

/**
 * Componente de indicador de carga (typing)
 * Muestra animación de puntos mientras el bot está "escribiendo"
 */
export function LoadingDots() {
  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="message-bubble message-bot">
        <div className="loading-dots">
          <div className="loading-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="loading-dot" style={{ animationDelay: '150ms' }}></div>
          <div className="loading-dot" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

