/**
 * IA-RMF (Risk Management Framework)
 * 
 * Módulo de evaluación y mitigación de riesgos para respuestas del chatbot.
 * Evalúa riesgos emocionales, técnicos, normativos y de sesgos antes de mostrar
 * una respuesta al usuario.
 * 
 * IMPORTANTE: Este es un framework modular y ampliable.
 * El contenido emocional real y las reglas específicas se añadirán manualmente.
 */

/**
 * Tipos de riesgo evaluados
 */
const RISK_TYPES = {
  EMOTIONAL: 'emotional',      // Mensaje inapropiado, frío, no empático
  TECHNICAL: 'technical',      // Alucinación, información médica peligrosa
  REGULATORY: 'regulatory',    // Prohibiciones, diagnósticos, tratamientos
  BIAS: 'bias'                 // Tono moralizante, culpabilizante, estereotipos
};

/**
 * Niveles de riesgo
 */
const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Evalúa el riesgo de una respuesta antes de mostrarla al usuario
 * 
 * @param {string} userMessage - Mensaje original del usuario
 * @param {string} llmResponse - Respuesta generada por el LLM
 * @param {Array} contextChunks - Chunks del RAG usados (opcional)
 * @returns {Object} Objeto con nivel de riesgo, issues y mitigación automática
 */
export function evaluateRisk(userMessage, llmResponse, contextChunks = []) {
  const issues = [];
  let riskScore = 0;

  // Validaciones básicas
  if (!llmResponse || llmResponse.trim().length === 0) {
    return {
      riskLevel: RISK_LEVELS.HIGH,
      issues: ['Respuesta vacía o inválida'],
      autoMitigation: 'Generar mensaje de fallback seguro'
    };
  }

  // 1. Evaluación de riesgo emocional
  const emotionalRisk = evaluateEmotionalRisk(userMessage, llmResponse);
  if (emotionalRisk.issues.length > 0) {
    issues.push(...emotionalRisk.issues.map(issue => `[Emocional] ${issue}`));
    riskScore += emotionalRisk.score;
  }

  // 2. Evaluación de riesgo técnico
  const technicalRisk = evaluateTechnicalRisk(llmResponse);
  if (technicalRisk.issues.length > 0) {
    issues.push(...technicalRisk.issues.map(issue => `[Técnico] ${issue}`));
    riskScore += technicalRisk.score;
  }

  // 3. Evaluación de riesgo normativo
  const regulatoryRisk = evaluateRegulatoryRisk(llmResponse);
  if (regulatoryRisk.issues.length > 0) {
    issues.push(...regulatoryRisk.issues.map(issue => `[Normativo] ${issue}`));
    riskScore += regulatoryRisk.score;
  }

  // 4. Evaluación de riesgo de sesgos
  const biasRisk = evaluateBiasRisk(llmResponse);
  if (biasRisk.issues.length > 0) {
    issues.push(...biasRisk.issues.map(issue => `[Sesgo] ${issue}`));
    riskScore += biasRisk.score;
  }

  // Determinar nivel de riesgo
  let riskLevel = RISK_LEVELS.LOW;
  if (riskScore >= 8) {
    riskLevel = RISK_LEVELS.HIGH;
  } else if (riskScore >= 4) {
    riskLevel = RISK_LEVELS.MEDIUM;
  }

  // Generar mensaje de mitigación automática
  const autoMitigation = generateMitigationMessage(riskLevel, issues);

  return {
    riskLevel,
    issues,
    autoMitigation,
    riskScore
  };
}

/**
 * Evalúa el riesgo emocional de la respuesta
 * 
 * @param {string} userMessage - Mensaje del usuario
 * @param {string} llmResponse - Respuesta del LLM
 * @returns {Object} Issues y score de riesgo emocional
 */
function evaluateEmotionalRisk(userMessage, llmResponse) {
  const issues = [];
  let score = 0;

  const responseLower = llmResponse.toLowerCase();

  // Detectar tono frío o poco empático
  const coldPhrases = [
    'no puedo ayudarte',
    'eso no es mi problema',
    'no es mi responsabilidad',
    'deberías saber',
    'es tu culpa'
  ];

  coldPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Tono frío detectado: "${phrase}"`);
      score += 2;
    }
  });

  // Detectar falta de empatía
  if (responseLower.length < 20) {
    issues.push('Respuesta demasiado corta, posible falta de empatía');
    score += 1;
  }

  // Detectar respuestas genéricas sin personalización
  const genericPhrases = [
    'espero que esto ayude',
    'buena suerte',
    'que tengas un buen día'
  ];

  let genericCount = 0;
  genericPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      genericCount++;
    }
  });

  if (genericCount >= 2 && responseLower.length < 100) {
    issues.push('Respuesta demasiado genérica sin personalización');
    score += 1;
  }

  return { issues, score };
}

/**
 * Evalúa el riesgo técnico (alucinaciones, información médica peligrosa)
 * 
 * @param {string} llmResponse - Respuesta del LLM
 * @returns {Object} Issues y score de riesgo técnico
 */
function evaluateTechnicalRisk(llmResponse) {
  const issues = [];
  let score = 0;

  const responseLower = llmResponse.toLowerCase();

  // Detectar afirmaciones médicas peligrosas
  const medicalDangerPhrases = [
    'debes tomar',
    'te recomiendo el medicamento',
    'el tratamiento correcto es',
    'debes hacerte una',
    'diagnóstico:',
    'tienes cáncer',
    'no tienes cáncer'
  ];

  medicalDangerPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Información médica peligrosa detectada: "${phrase}"`);
      score += 3; // Alto riesgo
    }
  });

  // Detectar números específicos de dosis o cantidades médicas
  const dosePattern = /\d+\s*(mg|ml|g|unidades|comprimidos|pastillas)/i;
  if (dosePattern.test(llmResponse)) {
    issues.push('Posible recomendación de dosis médica');
    score += 3;
  }

  // Detectar afirmaciones categóricas sin contexto
  const categoricalPhrases = [
    'siempre es así',
    'nunca pasa',
    'todos los casos',
    'es imposible'
  ];

  categoricalPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Afirmación categórica sin contexto: "${phrase}"`);
      score += 1;
    }
  });

  return { issues, score };
}

/**
 * Evalúa el riesgo normativo (prohibiciones, diagnósticos, tratamientos)
 * 
 * @param {string} llmResponse - Respuesta del LLM
 * @returns {Object} Issues y score de riesgo normativo
 */
function evaluateRegulatoryRisk(llmResponse) {
  const issues = [];
  let score = 0;

  const responseLower = llmResponse.toLowerCase();

  // Palabras prohibidas relacionadas con diagnósticos
  const diagnosticPhrases = [
    'te diagnostico',
    'tienes la enfermedad',
    'estás enfermo de',
    'padeces de',
    'sufres de'
  ];

  diagnosticPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Posible diagnóstico detectado: "${phrase}"`);
      score += 4; // Muy alto riesgo
    }
  });

  // Palabras relacionadas con tratamientos específicos
  const treatmentPhrases = [
    'debes seguir este tratamiento',
    'el mejor tratamiento es',
    'te prescribo',
    'debes hacer quimioterapia',
    'debes hacer radioterapia'
  ];

  treatmentPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Recomendación de tratamiento detectada: "${phrase}"`);
      score += 4;
    }
  });

  // Detectar promesas de cura
  const curePhrases = [
    'te curará',
    'sanará completamente',
    'garantizo la cura',
    '100% de éxito'
  ];

  curePhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Promesa de cura detectada: "${phrase}"`);
      score += 5; // Riesgo muy alto
    }
  });

  return { issues, score };
}

/**
 * Evalúa el riesgo de sesgos (tono moralizante, culpabilizante, estereotipos)
 * 
 * @param {string} llmResponse - Respuesta del LLM
 * @returns {Object} Issues y score de riesgo de sesgos
 */
function evaluateBiasRisk(llmResponse) {
  const issues = [];
  let score = 0;

  const responseLower = llmResponse.toLowerCase();

  // Detectar tono moralizante
  const moralizingPhrases = [
    'deberías haber',
    'no deberías',
    'está mal que',
    'es incorrecto',
    'no es apropiado'
  ];

  moralizingPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Tono moralizante detectado: "${phrase}"`);
      score += 2;
    }
  });

  // Detectar culpabilización
  const blamingPhrases = [
    'es tu culpa',
    'lo causaste',
    'tú provocaste',
    'deberías haberlo evitado'
  ];

  blamingPhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Culpabilización detectada: "${phrase}"`);
      score += 3;
    }
  });

  // Detectar estereotipos de género o edad
  const stereotypePhrases = [
    'las mujeres siempre',
    'los hombres nunca',
    'a tu edad',
    'las personas como tú'
  ];

  stereotypePhrases.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      issues.push(`Posible estereotipo detectado: "${phrase}"`);
      score += 2;
    }
  });

  return { issues, score };
}

/**
 * Genera un mensaje de mitigación automática basado en el nivel de riesgo
 * 
 * @param {string} riskLevel - Nivel de riesgo (low, medium, high)
 * @param {Array<string>} issues - Lista de issues detectados
 * @returns {string} Mensaje de mitigación
 */
function generateMitigationMessage(riskLevel, issues) {
  if (riskLevel === RISK_LEVELS.HIGH) {
    return `Respuesta bloqueada por alto riesgo. Se requiere revisión manual o mensaje de fallback seguro.
    
Issues detectados: ${issues.slice(0, 3).join(', ')}`;
  }

  if (riskLevel === RISK_LEVELS.MEDIUM) {
    return `Respuesta con riesgo medio. Considerar reescribir en tono más cuidadoso.
    
Issues detectados: ${issues.slice(0, 2).join(', ')}`;
  }

  return 'Respuesta segura. No se requiere mitigación.';
}

/**
 * Aplica mitigación automática si el riesgo es alto
 * 
 * @param {string} originalResponse - Respuesta original del LLM
 * @param {Object} riskAssessment - Resultado de evaluateRisk()
 * @returns {string} Respuesta original o mensaje de fallback
 */
export function applyAutoMitigation(originalResponse, riskAssessment) {
  if (riskAssessment.riskLevel === RISK_LEVELS.HIGH) {
    // Mensaje de fallback seguro
    // TODO: El contenido emocional real será añadido manualmente
    return `Gracias por compartir esto conmigo. Prefiero responderte con seguridad y cuidado.

Entiendo que estás pasando por un momento difícil, y quiero asegurarme de darte el mejor apoyo posible. 

Por favor, recuerda que:
- No puedo proporcionar diagnósticos médicos
- No puedo recomendar tratamientos específicos
- Mi objetivo es brindarte apoyo emocional

Si necesitas ayuda médica, te recomiendo consultar con profesionales de la salud.

¿Hay algo más en lo que pueda ayudarte desde el punto de vista emocional?`;
  }

  // Si el riesgo es bajo o medio, retornar respuesta original
  return originalResponse;
}

/**
 * Verifica si una respuesta debe ser bloqueada
 * 
 * @param {Object} riskAssessment - Resultado de evaluateRisk()
 * @returns {boolean} true si debe bloquearse
 */
export function shouldBlockResponse(riskAssessment) {
  return riskAssessment.riskLevel === RISK_LEVELS.HIGH;
}

