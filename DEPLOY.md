# Guía de Despliegue Completa

Esta guía te ayudará a desplegar CancerVidaBot en GitHub, Firebase Hosting y OpenRender (backend).

## 📋 Checklist Pre-Despliegue

- [ ] Node.js 18+ instalado
- [ ] Cuenta de GitHub creada
- [ ] Cuenta de Firebase creada (solo para hosting)
- [ ] Cuenta de OpenAI con API key
- [ ] Cuenta de OpenRender (para backend)

---

## 🚀 Paso 1: Configurar GitHub

### 1.1 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. No inicialices con README (ya tenemos uno)

### 1.2 Subir código a GitHub

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: CancerVidaBot MVP"

# Agregar remote de GitHub (reemplaza USERNAME y REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# Subir código
git branch -M main
git push -u origin main
```

### 1.3 Configurar .gitignore

Asegúrate de que `.gitignore` incluya:
- `.env` (nunca subir API keys)
- `node_modules/`
- `dist/`
- `.firebase/`

---

## 🔥 Paso 2: Configurar Firebase (Solo Hosting)

### 2.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2.2 Login en Firebase

```bash
firebase login
```

### 2.3 Inicializar proyecto Firebase

```bash
firebase init
```

Selecciona:
- ✅ Hosting
- ❌ Functions (NO necesario, usamos OpenRender)
- ❌ Firestore (opcional)

Cuando te pregunte:
- Selecciona tu proyecto existente o crea uno nuevo
- Para hosting: `dist` como directorio público
- Single-page app: **Sí**

### 2.4 Actualizar .firebaserc

Edita `.firebaserc` y cambia `"cancervida-bot"` por el ID de tu proyecto Firebase:

```json
{
  "projects": {
    "default": "TU_PROJECT_ID"
  }
}
```

---

## 🌐 Paso 3: Configurar OpenRender (Backend)

### 3.1 Crear cuenta en OpenRender

1. Ve a [OpenRender](https://render.com)
2. Crea una cuenta (puedes usar GitHub para login rápido)

### 3.2 Conectar repositorio

1. En OpenRender, ve a "New" > "Web Service"
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio de CancerVidaBot

### 3.3 Configurar el servicio

OpenRender detectará automáticamente `render.yaml`, pero verifica:

- **Name**: `cancervida-bot-api`
- **Environment**: `Node`
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Plan**: Free (o Starter/Standard para producción)

### 3.4 Configurar variables de entorno

En el dashboard de OpenRender, ve a "Environment" y añade:

- `OPENAI_API_KEY` = `sk-...` (tu API key de OpenAI)
- `NODE_ENV` = `production`

**IMPORTANTE**: Guarda la URL del servicio (ej: `https://cancervida-bot-api.onrender.com`)

### 3.5 Desplegar

1. Haz clic en "Create Web Service"
2. OpenRender construirá y desplegará automáticamente
3. Espera a que el estado sea "Live"
4. Prueba el health check: `https://tu-servicio.onrender.com/health`

---

## 🔐 Paso 4: Configurar Variables de Entorno

### Para Desarrollo Local

Crea `.env` en la raíz del proyecto:

```env
# Opción 1: Usar backend proxy (recomendado)
VITE_BACKEND_URL=https://tu-servicio.onrender.com
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Opción 2: Usar OpenAI directamente (menos seguro)
# VITE_OPENAI_API_KEY=sk-...
# VITE_OPENAI_MODEL=gpt-3.5-turbo
```

### Para Producción (Firebase Hosting)

En Firebase Console:
1. Ve a Hosting > Configuración
2. Añade variables de entorno:
   - `VITE_BACKEND_URL` = URL de tu servicio OpenRender
   - `VITE_OPENAI_MODEL` = `gpt-3.5-turbo` (opcional)

**O** configura en el build:

```bash
# En tu CI/CD o antes de build
export VITE_BACKEND_URL=https://tu-servicio.onrender.com
npm run build
```

---

## 🏗️ Paso 5: Construir y Desplegar Frontend

### 5.1 Construir el proyecto

```bash
npm run build
```

Esto creará la carpeta `dist/` con los archivos listos para producción.

### 5.2 Desplegar en Firebase Hosting

```bash
npm run deploy:hosting
```

O desplegar todo:

```bash
npm run deploy
```

### 5.3 Verificar despliegue

Tu app estará disponible en:
`https://TU_PROJECT_ID.web.app`

---

## ✅ Paso 6: Verificar Configuración

### 6.1 Verificar Backend (OpenRender)

```bash
# Health check
curl https://tu-servicio.onrender.com/health

# Debe retornar:
# {
#   "status": "ok",
#   "service": "CancerVidaBot API (OpenRender)",
#   "apiKeyConfigured": true,
#   "provider": "OpenAI"
# }
```

### 6.2 Verificar Frontend (Firebase)

1. Abre tu app desplegada
2. Abre la consola del navegador (F12)
3. Verifica que no hay errores
4. Prueba enviar un mensaje en el chat

### 6.3 Verificar que todo funciona

- [ ] El chat carga correctamente
- [ ] Se puede enviar un mensaje
- [ ] Se recibe respuesta del LLM
- [ ] No hay errores en la consola
- [ ] El dashboard de riesgos funciona

---

## 🐛 Troubleshooting

### Error: "VITE_BACKEND_URL no está configurada"

- Verifica que `.env` existe y tiene `VITE_BACKEND_URL`
- Reinicia el servidor de desarrollo
- En producción, verifica variables de entorno en Firebase

### Error: "OPENAI_API_KEY no configurada" (en OpenRender)

- Ve al dashboard de OpenRender
- Verifica que la variable `OPENAI_API_KEY` está configurada
- Reinicia el servicio

### Error: CORS en producción

- Verifica que CORS está configurado en `server/index.js` (ya está)
- Verifica que la URL del backend es correcta
- Verifica que el origen está permitido

### Error: "Error al comunicarse con el proxy"

- Verifica que `VITE_BACKEND_URL` es correcta
- Verifica que el servicio OpenRender está "Live"
- Prueba el health check manualmente

---

## 📝 Notas Importantes

1. **Nunca subas `.env` a GitHub** - Ya está en `.gitignore`
2. **Usa OpenRender como proxy** - Más seguro que exponer API key en el cliente
3. **Verifica los límites de OpenAI** - Puede tener rate limits según tu plan
4. **Monitorea los logs** - Revisa errores en OpenRender dashboard

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **Frontend**: Firebase Hosting (`https://TU_PROJECT_ID.web.app`)
- **Backend**: OpenRender (`https://tu-servicio.onrender.com`)
- **Código**: GitHub

Para actualizaciones futuras:

```bash
git add .
git commit -m "Descripción del cambio"
git push
# OpenRender se actualizará automáticamente
# Firebase: npm run build && npm run deploy:hosting
```

---

## 🔄 Flujo de Actualización

1. Hacer cambios en el código
2. `git push` (OpenRender se actualiza automáticamente)
3. `npm run build` (para frontend)
4. `npm run deploy:hosting` (desplegar frontend)
