import React, { useState, useEffect } from 'react';
import {
  getRiskLogs,
  getLogsByRiskLevel,
  getRiskStatistics,
  exportRiskLog,
  downloadRiskLog,
  clearRiskLogs
} from '../services/riskLog';

/**
 * Componente de dashboard para visualizar eventos de riesgo
 * Modo admin para monitoreo y análisis de riesgos
 */
export function RiskDashboard({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    filterLogs();
  }, [selectedRiskLevel, logs]);

  const loadLogs = () => {
    const allLogs = getRiskLogs();
    setLogs(allLogs);
    setStats(getRiskStatistics());
  };

  const filterLogs = () => {
    if (selectedRiskLevel === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(getLogsByRiskLevel(selectedRiskLevel));
    }
  };

  const handleExport = (format) => {
    downloadRiskLog(format);
  };

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
      clearRiskLogs();
      loadLogs();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dashboard de Riesgos</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-sm text-gray-600">Total eventos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.byLevel.low || 0}</p>
                <p className="text-sm text-gray-600">Bajo riesgo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.byLevel.medium || 0}</p>
                <p className="text-sm text-gray-600">Medio riesgo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.byLevel.high || 0}</p>
                <p className="text-sm text-gray-600">Alto riesgo</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Bloqueados: <span className="font-semibold">{stats.blocked}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Score promedio: <span className="font-semibold">{stats.averageRiskScore.toFixed(2)}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="px-6 py-3 border-b bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedRiskLevel('all')}
              className={`px-4 py-1 rounded text-sm ${
                selectedRiskLevel === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedRiskLevel('low')}
              className={`px-4 py-1 rounded text-sm ${
                selectedRiskLevel === 'low'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Bajo
            </button>
            <button
              onClick={() => setSelectedRiskLevel('medium')}
              className={`px-4 py-1 rounded text-sm ${
                selectedRiskLevel === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Medio
            </button>
            <button
              onClick={() => setSelectedRiskLevel('high')}
              className={`px-4 py-1 rounded text-sm ${
                selectedRiskLevel === 'high'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Alto
            </button>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No hay eventos de riesgo registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    log.riskLevel === 'high'
                      ? 'border-red-300 bg-red-50'
                      : log.riskLevel === 'medium'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.riskLevel === 'high'
                            ? 'bg-red-600 text-white'
                            : log.riskLevel === 'medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {log.riskLevel.toUpperCase()}
                      </span>
                      {log.wasBlocked && (
                        <span className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold">
                          BLOQUEADO
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Usuario:</strong> {log.userMessage.substring(0, 100)}
                    {log.userMessage.length > 100 && '...'}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Respuesta LLM:</strong> {log.llmResponse.substring(0, 100)}
                    {log.llmResponse.length > 100 && '...'}
                  </p>
                  {log.issues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Issues:</p>
                      <ul className="list-disc list-inside text-xs text-gray-600">
                        {log.issues.slice(0, 3).map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Score: {log.riskScore}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

