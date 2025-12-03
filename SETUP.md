# Guía de Configuración Rápida

## Pasos Iniciales

### 1. Instalar Dependencias

```bash
# Frontend
npm install

# Backend (Functions)
cd functions
npm install
cd ..
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

**Opcional (recomendado para producción):**

```env
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-tu-proyecto.cloudfunctions.net
```

### 3. Configurar Firebase Functions (si usas proxy)

```bash
# Configurar API key en Firebase
firebase functions:config:set openrouter.api_key="sk-or-v1-..."

# O usar el nuevo método (Firebase CLI v9+)
firebase functions:secrets:set OPENROUTER_API_KEY
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

## Estructura de Archivos Importantes

- `src/services/llmClient.js` - Cliente LLM (soporta proxy y directo)
- `src/services/ragEngine.js` - Motor RAG (vacío, listo para contenido)
- `src/services/iaRMF.js` - Framework de gestión de riesgos
- `src/rag/` - Base de conocimiento (embeddings.json y documents.json vacíos)

## Añadir Contenido

### RAG (Base de Conocimiento)

1. Poblar `src/rag/documents.json` con documentos
2. Generar embeddings y poblar `src/rag/embeddings.json`
3. El sistema RAG se cargará automáticamente

### Prompt del Sistema

Editar `src/services/llmClient.js` función `getSystemPrompt()` para añadir el contenido emocional completo.

## Despliegue

```bash
# Construir
npm run build

# Desplegar hosting
npm run deploy:hosting

# Desplegar functions (si aplica)
npm run deploy:functions
```

## Troubleshooting

### Error: "VITE_OPENROUTER_API_KEY no está configurada"

- Verifica que el archivo `.env` existe en la raíz
- Reinicia el servidor de desarrollo después de crear/modificar `.env`

### Error: "Error al comunicarse con el proxy"

- Verifica que `VITE_FIREBASE_FUNCTIONS_URL` está correcta
- Asegúrate de que las Functions están desplegadas
- Verifica que la API key está configurada en Firebase Functions

### RAG no funciona

- Es normal si los archivos están vacíos
- El sistema funcionará sin RAG, solo sin contexto adicional

