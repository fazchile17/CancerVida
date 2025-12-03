# Guía de Contribución

## Áreas que Requieren Contenido Manual

Este proyecto está estructurado y listo para funcionar, pero los siguientes componentes requieren contenido humano que debe añadirse manualmente:

### 1. Contenido Emocional del RAG

**Archivos:**
- `src/rag/documents.json` - Documentos de la base de conocimiento
- `src/rag/embeddings.json` - Embeddings vectoriales de los documentos

**Pasos:**
1. Añadir documentos de Fundación CancerVida en formato JSON
2. Generar embeddings usando un servicio (OpenAI, Sentence Transformers, etc.)
3. El motor RAG se cargará automáticamente

**Formato esperado:**

```json
// documents.json
[
  {
    "text": "Contenido del documento...",
    "metadata": {
      "source": "Fundación CancerVida",
      "category": "apoyo_emocional"
    }
  }
]

// embeddings.json
[
  {
    "vector": [0.123, 0.456, ...],
    "documentId": 0
  }
]
```

### 2. Prompt del Sistema

**Archivo:** `src/services/llmClient.js`

**Función:** `getSystemPrompt()`

Añadir el prompt completo con:
- Personalidad del bot
- Instrucciones emocionales específicas
- Guías de comunicación
- Límites y restricciones

### 3. Validación con Usuarios

**Archivos:**
- `docs/validation_template.md` - Plantilla para resultados
- `docs/survey_template.md` - Plantilla de encuesta

Completar con:
- Resultados de pruebas con usuarios reales
- Métricas de satisfacción
- Feedback cualitativo
- Mejoras identificadas

### 4. Documentación Profesional

**Archivo:** `docs/documentation_template.md`

Completar con:
- Documentación técnica completa
- Diagramas de arquitectura
- Guías de uso
- Referencias y recursos

### 5. Mensajes de Fallback del IA-RMF

**Archivo:** `src/services/iaRMF.js`

**Función:** `applyAutoMitigation()`

Personalizar los mensajes de fallback con contenido emocional apropiado de Fundación CancerVida.

## Estructura del Código

El código está organizado de forma modular:

- **Componentes** (`src/components/`) - UI reutilizable
- **Servicios** (`src/services/`) - Lógica de negocio
- **Contexto** (`src/context/`) - Estado global de React
- **RAG** (`src/rag/`) - Base de conocimiento

## Buenas Prácticas

1. **No commitees API keys** - Usa variables de entorno
2. **Mantén el código limpio** - Sigue los estándares de ESLint
3. **Documenta cambios** - Añade comentarios cuando sea necesario
4. **Prueba antes de desplegar** - Verifica en desarrollo primero

## Extensión del IA-RMF

El módulo `src/services/iaRMF.js` es extensible. Puedes añadir:

- Nuevos tipos de evaluación de riesgo
- Patrones de detección personalizados
- Reglas específicas del dominio
- Integraciones con servicios externos

