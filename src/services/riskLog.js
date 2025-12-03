/**
 * Sistema de logging de eventos de riesgo
 * 
 * Almacena eventos de evaluación de riesgo en localStorage y Firestore
 * para análisis posterior y auditoría.
 */

import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const STORAGE_KEY = 'cancervida_risk_logs';
const MAX_LOGS = 1000; // Límite de logs en localStorage
const RISK_LOGS_COLLECTION = 'riskLogs';

/**
 * Estructura de un evento de riesgo
 * @typedef {Object} RiskEvent
 * @property {string} timestamp - ISO timestamp del evento
 * @property {string} userMessage - Mensaje original del usuario
 * @property {string} llmResponse - Respuesta generada por el LLM
 * @property {string} riskLevel - Nivel de riesgo (low, medium, high)
 * @property {Array<string>} issues - Lista de issues detectados
 * @property {number} riskScore - Puntuación numérica de riesgo
 * @property {boolean} wasBlocked - Si la respuesta fue bloqueada
 * @property {string} finalResponse - Respuesta final mostrada al usuario
 */

/**
 * Registra un evento de riesgo
 * 
 * @param {Object} eventData - Datos del evento de riesgo
 * @param {string} eventData.userMessage - Mensaje del usuario
 * @param {string} eventData.llmResponse - Respuesta del LLM
 * @param {string} eventData.riskLevel - Nivel de riesgo
 * @param {Array<string>} eventData.issues - Issues detectados
 * @param {number} eventData.riskScore - Puntuación de riesgo
 * @param {boolean} eventData.wasBlocked - Si fue bloqueada
 * @param {string} eventData.finalResponse - Respuesta final
 * @param {string} eventData.userId - ID del usuario (opcional)
 * @param {string} eventData.chatId - ID del chat (opcional)
 */
export function logRiskEvent(eventData) {
  try {
    const event = {
      timestamp: new Date().toISOString(),
      userMessage: eventData.userMessage || '',
      llmResponse: eventData.llmResponse || '',
      riskLevel: eventData.riskLevel || 'unknown',
      issues: eventData.issues || [],
      riskScore: eventData.riskScore || 0,
      wasBlocked: eventData.wasBlocked || false,
      finalResponse: eventData.finalResponse || '',
      userId: eventData.userId || '',
      chatId: eventData.chatId || ''
    };

    // Guardar en localStorage (backup)
    const logs = getRiskLogs();
    logs.unshift(event);
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

    // Guardar en Firestore (si hay userId)
    if (eventData.userId) {
      logRiskEventToFirestore(eventData).catch(err => {
        console.warn('Error guardando log en Firestore:', err);
        // No es crítico, ya está en localStorage
      });
    }

    console.log('Risk event logged:', {
      riskLevel: event.riskLevel,
      wasBlocked: event.wasBlocked,
      issuesCount: event.issues.length
    });

  } catch (error) {
    console.error('Error logging risk event:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Obtiene todos los logs de riesgo
 * 
 * @returns {Array<RiskEvent>} Array de eventos de riesgo
 */
export function getRiskLogs() {
  try {
    const logsJson = localStorage.getItem(STORAGE_KEY);
    if (!logsJson) {
      return [];
    }
    return JSON.parse(logsJson);
  } catch (error) {
    console.error('Error reading risk logs:', error);
    return [];
  }
}

/**
 * Filtra logs por nivel de riesgo
 * 
 * @param {string} riskLevel - Nivel de riesgo (low, medium, high)
 * @returns {Array<RiskEvent>} Logs filtrados
 */
export function getLogsByRiskLevel(riskLevel) {
  const logs = getRiskLogs();
  return logs.filter(log => log.riskLevel === riskLevel);
}

/**
 * Obtiene estadísticas de los logs
 * 
 * @returns {Object} Estadísticas de riesgo
 */
export function getRiskStatistics() {
  const logs = getRiskLogs();
  
  const stats = {
    total: logs.length,
    byLevel: {
      low: 0,
      medium: 0,
      high: 0
    },
    blocked: 0,
    averageRiskScore: 0
  };

  let totalScore = 0;

  logs.forEach(log => {
    stats.byLevel[log.riskLevel] = (stats.byLevel[log.riskLevel] || 0) + 1;
    if (log.wasBlocked) {
      stats.blocked++;
    }
    totalScore += log.riskScore || 0;
  });

  if (logs.length > 0) {
    stats.averageRiskScore = totalScore / logs.length;
  }

  return stats;
}

/**
 * Exporta los logs como JSON
 * 
 * @returns {string} JSON string de los logs
 */
export function exportRiskLog() {
  const logs = getRiskLogs();
  return JSON.stringify(logs, null, 2);
}

/**
 * Exporta los logs como CSV
 * 
 * @returns {string} CSV string de los logs
 */
export function exportRiskLogCSV() {
  const logs = getRiskLogs();
  
  if (logs.length === 0) {
    return '';
  }

  // Headers
  const headers = [
    'Timestamp',
    'Risk Level',
    'Risk Score',
    'Was Blocked',
    'Issues Count',
    'User Message (truncated)',
    'LLM Response (truncated)'
  ];

  // Filas
  const rows = logs.map(log => [
    log.timestamp,
    log.riskLevel,
    log.riskScore,
    log.wasBlocked ? 'Yes' : 'No',
    log.issues.length,
    (log.userMessage || '').substring(0, 50),
    (log.llmResponse || '').substring(0, 50)
  ]);

  // Convertir a CSV
  const csvRows = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ];

  return csvRows.join('\n');
}

/**
 * Limpia todos los logs
 */
export function clearRiskLogs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Risk logs cleared');
  } catch (error) {
    console.error('Error clearing risk logs:', error);
  }
}

/**
 * Descarga los logs como archivo
 * 
 * @param {string} format - Formato de exportación ('json' o 'csv')
 */
export function downloadRiskLog(format = 'json') {
  const content = format === 'csv' ? exportRiskLogCSV() : exportRiskLog();
  const extension = format === 'csv' ? 'csv' : 'json';
  const mimeType = format === 'csv' ? 'text/csv' : 'application/json';

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `risk_logs_${new Date().toISOString().split('T')[0]}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Guarda un evento de riesgo en Firestore
 * 
 * @param {Object} eventData - Datos del evento de riesgo
 * @param {string} eventData.userId - ID del usuario
 * @param {string} eventData.chatId - ID del chat
 * @returns {Promise<void>}
 */
export async function logRiskEventToFirestore(eventData) {
  try {
    if (!eventData.userId) {
      return; // No guardar si no hay userId
    }

    const riskLogRef = collection(db, RISK_LOGS_COLLECTION);
    
    const logData = {
      userId: eventData.userId || '',
      chatId: eventData.chatId || '',
      userMessage: eventData.userMessage || '',
      llmResponse: eventData.llmResponse || '',
      riskLevel: eventData.riskLevel || 'unknown',
      issues: eventData.issues || [],
      riskScore: eventData.riskScore || 0,
      wasBlocked: eventData.wasBlocked || false,
      finalResponse: eventData.finalResponse || '',
      timestamp: serverTimestamp()
    };

    await addDoc(riskLogRef, logData);
  } catch (error) {
    console.error('Error guardando log en Firestore:', error);
    throw error;
  }
}

/**
 * Obtiene logs de riesgo desde Firestore
 * 
 * @param {string} userId - ID del usuario (opcional, filtra por usuario)
 * @param {string} chatId - ID del chat (opcional, filtra por chat)
 * @param {string} riskLevel - Nivel de riesgo (opcional, filtra por nivel)
 * @returns {Promise<Array>} Array de eventos de riesgo
 */
export async function getRiskLogsFromFirestore(userId = null, chatId = null, riskLevel = null) {
  try {
    const riskLogsRef = collection(db, RISK_LOGS_COLLECTION);
    let q = query(riskLogsRef, orderBy('timestamp', 'desc'));

    // Aplicar filtros
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    if (chatId) {
      q = query(q, where('chatId', '==', chatId));
    }
    if (riskLevel) {
      q = query(q, where('riskLevel', '==', riskLevel));
    }

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
      const logData = doc.data();
      logs.push({
        logId: doc.id,
        ...logData,
        timestamp: logData.timestamp?.toDate?.()?.toISOString() || logData.timestamp
      });
    });

    return logs;
  } catch (error) {
    console.error('Error obteniendo logs de Firestore:', error);
    return [];
  }
}

/**
 * Sincroniza logs de localStorage a Firestore
 * 
 * @param {string} userId - ID del usuario
 * @returns {Promise<void>}
 */
export async function syncLogsToFirestore(userId) {
  try {
    if (!userId) return;

    const localLogs = getRiskLogs();
    const unsyncedLogs = localLogs.filter(log => !log.syncedToFirestore);

    for (const log of unsyncedLogs) {
      try {
        await logRiskEventToFirestore({
          ...log,
          userId: userId
        });
        // Marcar como sincronizado (opcional, se puede implementar)
      } catch (err) {
        console.warn('Error sincronizando log:', err);
      }
    }
  } catch (error) {
    console.error('Error sincronizando logs:', error);
  }
}

