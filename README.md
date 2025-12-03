# CancerVidaBot - Chatbot de Apoyo Emocional

MVP funcional de un chatbot emocional diseñado para brindar apoyo a pacientes con cáncer y sus familias.

## 🚀 Características

- **Chat UI moderna**: Interfaz tipo WhatsApp con diseño accesible
- **Integración con LLM**: Uso de modelos preentrenados vía OpenAI
- **RAG ligero**: Sistema de recuperación de información (estructura lista, contenido por añadir)
- **IA-RMF**: Framework de gestión de riesgos para evaluar y mitigar respuestas
- **Backend seguro**: Proxy con Firebase Cloud Functions para proteger API keys
- **Hosting**: Despliegue en Firebase Hosting

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase
- Cuenta de OpenAI con API key
- Git

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias de las funciones
cd functions
npm install
cd ..
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Opción 1: Usar backend proxy (recomendado)
VITE_BACKEND_URL=https://tu-servicio.onrender.com
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Opción 2: Usar OpenAI directamente (menos seguro)
# VITE_OPENAI_API_KEY=sk-...
# VITE_OPENAI_MODEL=gpt-3.5-turbo
```

**Nota**: Para producción, es recomendable usar el backend proxy (OpenRender) en lugar de exponer la API key en el cliente.

### 3. Configurar OpenRender (Backend)

1. Sube el código a GitHub
2. Ve a [OpenRender](https://render.com)
3. Crea un nuevo "Web Service"
4. Conecta tu repositorio
5. Configura variable de entorno: `OPENAI_API_KEY=sk-...`

### 4. Inicializar Firebase (si es la primera vez)

```bash
firebase login
firebase init
```

Selecciona:
- Hosting
- Functions
- Firestore (opcional)

## 🏃 Ejecutar en Desarrollo

### Frontend

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Backend (OpenRender - local para pruebas)

```bash
cd server
npm start
# El backend estará en http://localhost:3000
```

## 🏗️ Construir para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🚢 Desplegar

### Backend: OpenRender (Recomendado)

1. Sube el código a GitHub
2. Ve a [OpenRender](https://render.com)
3. Crea un nuevo "Web Service"
4. Conecta tu repositorio
5. Configura variable: `OPENAI_API_KEY=sk-...`
6. Despliega automáticamente

**Ver configuración en:** `render.yaml` y `DEPLOY.md`

### Frontend: Firebase Hosting

```bash
# 1. Login e inicializar Firebase (solo primera vez)
firebase login
firebase init
# Selecciona: Hosting (NO Functions)

# 2. Construir y desplegar
npm run build
npm run deploy:hosting
```

**Ver guía completa en:** `DEPLOY.md`

### Desplegar solo Hosting

```bash
npm run deploy:hosting
```

### Desplegar solo Functions

```bash
npm run deploy:functions
```

## 📁 Estructura del Proyecto

```
/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── InputBox.jsx
│   │   ├── LoadingDots.jsx
│   │   └── RiskDashboard.jsx
│   ├── services/            # Servicios principales
│   │   ├── llmClient.js     # Cliente LLM (OpenAI)
│   │   ├── ragEngine.js     # Motor RAG
│   │   ├── iaRMF.js         # Framework de gestión de riesgos
│   │   └── riskLog.js       # Sistema de logging de riesgos
│   ├── context/             # Contexto React
│   │   └── ChatContext.jsx
│   ├── rag/                 # Base de conocimiento (vacía)
│   │   ├── embeddings.json
│   │   └── documents.json
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── server/                  # Backend Express para OpenRender
│   ├── index.js
│   └── package.json
├── docs/                    # Documentación (plantillas)
│   ├── validation_template.md
│   ├── documentation_template.md
│   └── survey_template.md
├── public/
├── firebase.json
├── vite.config.js
└── package.json
```

## 🔧 Configuración Avanzada

### Usar Backend Proxy (Recomendado para Producción)

Para usar el backend proxy en lugar de llamar directamente a OpenAI desde el cliente:

1. Despliega el backend en OpenRender (ver `DEPLOY.md`)
2. Actualiza la URL en la variable de entorno `VITE_BACKEND_URL`
3. El backend protegerá tu API key de OpenAI

### Añadir Contenido al RAG

Los archivos `src/rag/embeddings.json` y `src/rag/documents.json` están vacíos y listos para ser poblados con:

- Contenido emocional de Fundación CancerVida
- Base de conocimiento especializada
- Embeddings generados (usar un servicio de embeddings real)

### Personalizar IA-RMF

El módulo `src/services/iaRMF.js` es modular y puede extenderse con:

- Reglas de evaluación adicionales
- Patrones de detección personalizados
- Mensajes de fallback específicos

## 🧪 Testing

```bash
npm run lint
```

## 📝 Notas Importantes

- **Contenido emocional**: Los contenidos humanos (corpus emocional, RAG final, validación) deben añadirse manualmente
- **API Keys**: Nunca commitees archivos `.env` o API keys en el código
- **Backend**: Usa OpenRender como proxy para proteger tu API key de OpenAI
- **RAG**: El sistema RAG funciona en modo vacío hasta que se añadan los embeddings y documentos
- **IA-RMF**: El framework de riesgos está activo y bloquea respuestas de alto riesgo automáticamente

## 🤝 Contribución

Este es un proyecto MVP. Las mejoras y extensiones son bienvenidas.

## 📄 Licencia

[Especificar licencia]

## 👥 Contacto

[Información de contacto]

---

**Desarrollado con ❤️ para Fundación CancerVida**

