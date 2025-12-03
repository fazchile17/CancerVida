import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import {
  getGlobalStats,
  getUserStats,
  getMessagesByDay,
  getActiveUsers,
  getRAGStats
} from '../services/statsService';
import { getRiskLogsFromFirestore } from '../services/riskLog';
import { downloadRiskLog } from '../services/riskLog';

/**
 * Dashboard Global (modo pruebas)
 * Muestra información completa del sistema
 */
export function GlobalDashboard({ isOpen, onClose }) {
  const { users, loadUsers } = useUser();
  const [globalStats, setGlobalStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [messagesByDay, setMessagesByDay] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [ragStats, setRagStats] = useState(null);
  const [riskLogs, setRiskLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadUsers();
      
      const [stats, messages, active, rag, logs] = await Promise.all([
        getGlobalStats(),
        getMessagesByDay(30),
        getActiveUsers(7),
        getRAGStats(),
        getRiskLogsFromFirestore()
      ]);

      setGlobalStats(stats);
      setMessagesByDay(messages);
      setActiveUsers(active);
      setRagStats(rag);
      setRiskLogs(logs);

      // Cargar estadísticas por usuario
      const userStatsData = [];
      for (const user of users) {
        try {
          const stats = await getUserStats(user.userId);
          userStatsData.push({ ...user, ...stats });
        } catch (err) {
          console.warn(`Error obteniendo stats de ${user.userId}:`, err);
        }
      }
      setUserStats(userStatsData);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Dashboard Global</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex">
          {['overview', 'users', 'rag', 'risks', 'stats'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 text-sm font-medium ${
                selectedTab === tab
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'overview' ? 'Resumen' :
               tab === 'users' ? 'Usuarios' :
               tab === 'rag' ? 'RAG' :
               tab === 'risks' ? 'Riesgos' :
               'Estadísticas'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <>
              {/* Overview Tab */}
              {selectedTab === 'overview' && globalStats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{globalStats.totalUsers}</p>
                      <p className="text-sm text-gray-600">Usuarios</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{globalStats.totalChats}</p>
                      <p className="text-sm text-gray-600">Chats</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{globalStats.totalMessages}</p>
                      <p className="text-sm text-gray-600">Mensajes</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{globalStats.totalRiskEvents}</p>
                      <p className="text-sm text-gray-600">Eventos Riesgo</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Usuarios activos (últimos 7 días): <span className="font-semibold">{globalStats.activeUsers}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {selectedTab === 'users' && (
                <div className="space-y-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chats</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensajes</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Uso</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userStats.map((user) => (
                        <tr key={user.userId}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.chatCount || 0}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.totalMessages || 0}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(user.lastActiveAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* RAG Tab */}
              {selectedTab === 'rag' && ragStats && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Estado del RAG</h3>
                    <p className="text-sm text-gray-600">Documentos: {ragStats.documentsCount}</p>
                    <p className="text-sm text-gray-600">Embeddings: {ragStats.embeddingsCount}</p>
                    <p className="text-sm text-gray-600">Estado: {ragStats.status}</p>
                  </div>
                </div>
              )}

              {/* Risks Tab */}
              {selectedTab === 'risks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Eventos de Riesgo</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadRiskLog('json')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Exportar JSON
                      </button>
                      <button
                        onClick={() => downloadRiskLog('csv')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Exportar CSV
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bloqueado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {riskLogs.slice(0, 100).map((log) => (
                          <tr key={log.logId}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(log.timestamp)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs ${
                                log.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                log.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {log.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.riskScore}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {log.wasBlocked ? 'Sí' : 'No'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {selectedTab === 'stats' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Mensajes por Día (últimos 30 días)</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {messagesByDay.map(({ date, count }) => (
                        <div key={date} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-24">{date}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-primary-500 h-4 rounded-full"
                              style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Usuarios Activos</h3>
                    <p className="text-sm text-gray-600">
                      {activeUsers.length} usuarios activos en los últimos 7 días
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

