/**
 * Sistema de logging de eventos de riesgo
 * 
 * Almacena eventos de evaluación de riesgo en localStorage
 * para análisis posterior y auditoría.
 */

const STORAGE_KEY = 'cancervida_risk_logs';
const MAX_LOGS = 1000; // Límite de logs en localStorage

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
      finalResponse: eventData.finalResponse || ''
    };

    // Obtener logs existentes
    const logs = getRiskLogs();

    // Agregar nuevo evento al inicio
    logs.unshift(event);

    // Limitar el número de logs
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

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

