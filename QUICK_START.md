# 🚀 Inicio Rápido - CancerVidaBot

Guía rápida para tener el proyecto funcionando en 10 minutos.

## 1️⃣ Instalación Rápida

```bash
# Clonar o descargar el proyecto
cd "Entrega 12 dic"

# Instalar dependencias frontend
npm install

# Instalar dependencias backend (OpenRender)
cd server
npm install
cd ..
```

## 2️⃣ Configurar API Key de OpenAI

Crea un archivo `.env` en la raíz del proyecto:

```env
# Opción 1: Usar backend proxy (recomendado)
VITE_BACKEND_URL=https://tu-servicio.onrender.com
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Opción 2: Usar OpenAI directamente (menos seguro)
# VITE_OPENAI_API_KEY=sk-...
# VITE_OPENAI_MODEL=gpt-3.5-turbo
```

**Obtén tu API key de OpenAI en:** https://platform.openai.com/api-keys

## 3️⃣ Probar Localmente

### Opción A: Con Backend Local (Recomendado)

```bash
# Terminal 1: Iniciar backend
cd server
npm start
# Debe estar en http://localhost:3000

# Terminal 2: Iniciar frontend
cd ..
npm run dev
# Abre http://localhost:5173
```

### Opción B: Solo Frontend (requiere API key en .env)

```bash
npm run dev
# Abre http://localhost:5173
```

## 4️⃣ Desplegar Backend en OpenRender

1. **Sube el código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USER/REPO.git
   git push -u origin main
   ```

2. **Ve a [OpenRender](https://render.com)**
   - Crea cuenta
   - "New" > "Web Service"
   - Conecta tu repositorio de GitHub

3. **Configura el servicio**
   - OpenRender detectará `render.yaml` automáticamente
   - Añade variable de entorno: `OPENAI_API_KEY=sk-...`
   - Haz clic en "Create Web Service"

4. **Espera el despliegue**
   - Toma ~5 minutos la primera vez
   - Anota la URL (ej: `https://cancervida-bot-api.onrender.com`)

5. **Actualiza `.env` con la URL del backend**
   ```env
   VITE_BACKEND_URL=https://tu-servicio.onrender.com
   ```

## 5️⃣ Desplegar Frontend en Firebase

```bash
# 1. Login en Firebase
firebase login

# 2. Inicializar (solo primera vez)
firebase init
# Selecciona: Hosting
# Directorio: dist

# 3. Construir y desplegar
npm run build
npm run deploy:hosting
```

Tu app estará en: `https://TU_PROJECT_ID.web.app`

## ✅ Listo!

Tu chatbot estará funcionando. Para más detalles, ver:
- `DEPLOY.md` - Guía completa de despliegue
- `SETUP.md` - Configuración detallada
- `CHECKLIST.md` - Verificación paso a paso

## 🔍 Verificación Rápida

```bash
# Backend health check
curl https://tu-servicio.onrender.com/health

# Debe retornar: {"status":"ok","provider":"OpenAI",...}
```
