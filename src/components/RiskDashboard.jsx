import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import {
  getRiskLogs,
  getLogsByRiskLevel,
  getRiskStatistics,
  exportRiskLog,
  downloadRiskLog,
  clearRiskLogs,
  getRiskLogsFromFirestore
} from '../services/riskLog';

/**
 * Componente de dashboard para visualizar eventos de riesgo
 * Modo admin para monitoreo y análisis de riesgos
 */
export function RiskDashboard({ isOpen, onClose }) {
  const { currentUser, users } = useUser();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [useFirestore, setUseFirestore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, useFirestore]);

  useEffect(() => {
    filterLogs();
  }, [selectedRiskLevel, selectedUserId, logs]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let allLogs = [];
      
      if (useFirestore) {
        // Cargar desde Firestore
        const userId = selectedUserId !== 'all' ? selectedUserId : null;
        allLogs = await getRiskLogsFromFirestore(userId, null, selectedRiskLevel !== 'all' ? selectedRiskLevel : null);
      } else {
        // Cargar desde localStorage
        allLogs = getRiskLogs();
      }
      
      setLogs(allLogs);
      calculateStats(allLogs);
    } catch (error) {
      console.error('Error cargando logs:', error);
      // Fallback a localStorage
      const localLogs = getRiskLogs();
      setLogs(localLogs);
      calculateStats(localLogs);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logList) => {
    const stats = {
      total: logList.length,
      byLevel: { low: 0, medium: 0, high: 0 },
      blocked: 0,
      averageRiskScore: 0
    };

    let totalScore = 0;
    logList.forEach(log => {
      stats.byLevel[log.riskLevel] = (stats.byLevel[log.riskLevel] || 0) + 1;
      if (log.wasBlocked) stats.blocked++;
      totalScore += log.riskScore || 0;
    });

    if (logList.length > 0) {
      stats.averageRiskScore = totalScore / logList.length;
    }

    setStats(stats);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filtrar por nivel de riesgo
    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(log => log.riskLevel === selectedRiskLevel);
    }

    // Filtrar por usuario
    if (selectedUserId !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedUserId);
    }

    setFilteredLogs(filtered);
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
        <div className="px-6 py-3 border-b bg-white space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Fuente:</label>
            <button
              onClick={() => setUseFirestore(!useFirestore)}
              className={`px-3 py-1 rounded text-sm ${
                useFirestore
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {useFirestore ? 'Firestore' : 'LocalStorage'}
            </button>
            {loading && <span className="text-sm text-gray-500">Cargando...</span>}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-gray-600">Usuario:</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">Todos</option>
              {users.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

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
              {filteredLogs.map((log) => (
                <div
                  key={log.logId || log.timestamp}
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

