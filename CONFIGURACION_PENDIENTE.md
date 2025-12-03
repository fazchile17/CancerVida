# ⚙️ Configuración Pendiente - Resumen

Este documento lista TODO lo que necesitas configurar antes de desplegar.

## 🔑 1. API Key de OpenAI (OBLIGATORIO)

### Obtener API Key
- [ ] Crear cuenta en: https://platform.openai.com
- [ ] Ir a API Keys: https://platform.openai.com/api-keys
- [ ] Crear nueva API key
- [ ] Copiar la key (empieza con `sk-`)

### Configurar en Desarrollo
- [ ] Crear archivo `.env` en la raíz del proyecto
- [ ] Añadir: `VITE_OPENAI_API_KEY=sk-...` (si usas modo directo)
- [ ] O añadir: `VITE_BACKEND_URL=https://tu-servicio.onrender.com` (si usas proxy)

**Sin esto, la aplicación NO funcionará.**

---

## 🔥 2. Firebase (Solo para Hosting del Frontend)

### Configuración Inicial
- [ ] Crear cuenta en: https://firebase.google.com
- [ ] Crear nuevo proyecto en Firebase Console
- [ ] Anotar el **Project ID** (ej: `mi-proyecto-12345`)

### Firebase CLI
- [ ] Instalar: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Inicializar: `firebase init`
  - Seleccionar: **Hosting** ✅
  - NO seleccionar Functions (usamos OpenRender)
  - Project ID: usar el que creaste
  - Public directory: `dist`
  - Single-page app: **Sí**

### Actualizar .firebaserc
- [ ] Editar `.firebaserc` y cambiar `"cancervida-bot"` por tu Project ID real

---

## 🌐 3. OpenRender (Backend - OBLIGATORIO)

### Crear Cuenta
- [ ] Crear cuenta en: https://render.com
- [ ] Puedes usar GitHub para login rápido

### Conectar Repositorio
- [ ] Subir código a GitHub primero (ver paso 4)
- [ ] En OpenRender: "New" > "Web Service"
- [ ] Conectar repositorio de GitHub
- [ ] Seleccionar el repositorio de CancerVidaBot

### Configurar Servicio
- [ ] OpenRender detectará `render.yaml` automáticamente
- [ ] Verificar configuración:
  - Build Command: `cd server && npm install`
  - Start Command: `cd server && npm start`
  - Plan: Free (o Starter/Standard para producción)

### Configurar Variables de Entorno
En el dashboard de OpenRender, añade:
- `OPENAI_API_KEY` = `sk-...` (tu API key de OpenAI)
- `NODE_ENV` = `production`

### Anotar URL del Servicio
- [ ] Después del despliegue, anotar la URL (ej: `https://cancervida-bot-api.onrender.com`)
- [ ] Actualizar `.env` del frontend:
  ```
  VITE_BACKEND_URL=https://tu-servicio.onrender.com
  ```

---

## 🐙 4. GitHub

### Repositorio
- [ ] Crear repositorio en GitHub (público o privado)
- [ ] NO inicializar con README (ya tenemos uno)

### Subir Código
```bash
git init
git add .
git commit -m "Initial commit: CancerVidaBot MVP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Verificar Seguridad
- [ ] Confirmar que `.env` NO está en el repositorio
- [ ] Verificar que `.gitignore` incluye `.env`

---

## ✅ 5. Verificación Final

### Local
```bash
# Instalar dependencias
npm install
cd server && npm install && cd ..

# Probar backend localmente
cd server
npm start
# Debe estar en http://localhost:3000

# Probar frontend localmente (otra terminal)
npm run dev
# Abrir http://localhost:5173
# Probar enviar un mensaje
```

### Build
```bash
npm run build
# Verificar que se creó la carpeta dist/
```

### Despliegue
```bash
# Backend (OpenRender se actualiza automáticamente al hacer git push)
git push

# Frontend (Firebase)
npm run deploy:hosting
```

---

## 📝 6. Variables de Entorno - Resumen

### Desarrollo (archivo `.env`)
```env
# Opción 1: Usar backend proxy (recomendado)
VITE_BACKEND_URL=https://tu-servicio.onrender.com
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Opción 2: Usar OpenAI directamente (menos seguro)
# VITE_OPENAI_API_KEY=sk-...
# VITE_OPENAI_MODEL=gpt-3.5-turbo
```

### Producción OpenRender
- Configurar en: Dashboard de OpenRender > Environment Variables
- `OPENAI_API_KEY` = `sk-...`
- `NODE_ENV` = `production`

### Producción Firebase Hosting
- Configurar en: Firebase Console > Hosting > Configuración
- O en el build: `export VITE_BACKEND_URL=... && npm run build`

---

## 🚨 Problemas Comunes - Verificación

### "VITE_BACKEND_URL no está configurada"
- ✅ Verifica que `.env` existe en la raíz
- ✅ Reinicia el servidor de desarrollo
- ✅ Verifica que la variable empieza con `VITE_`

### "Error al comunicarse con el proxy"
- ✅ Verifica que `VITE_BACKEND_URL` es correcta
- ✅ Verifica que el servicio OpenRender está "Live"
- ✅ Prueba el health check: `curl https://tu-servicio.onrender.com/health`

### "OPENAI_API_KEY no configurada" (en OpenRender)
- ✅ Ve al dashboard de OpenRender
- ✅ Verifica que la variable `OPENAI_API_KEY` está configurada
- ✅ Reinicia el servicio

### Error de CORS
- ✅ Verifica que CORS está configurado en `server/index.js` (ya está)
- ✅ Verifica que la URL del backend es correcta

---

## 📚 Documentación de Referencia

- `QUICK_START.md` - Inicio rápido (10 minutos)
- `DEPLOY.md` - Guía completa de despliegue
- `SETUP.md` - Configuración detallada
- `CHECKLIST.md` - Checklist completo paso a paso

---

## 🎯 Orden Recomendado de Configuración

1. **API Key de OpenAI** (5 min)
2. **Crear `.env`** (2 min)
3. **Probar localmente** (5 min)
4. **Subir a GitHub** (5 min)
5. **Configurar OpenRender** (10 min)
6. **Configurar Firebase** (10 min)
7. **Desplegar frontend** (5 min)
8. **Verificar en producción** (5 min)

**Total: ~50 minutos**

---

## ✅ Cuando Todo Esté Listo

- [ ] La app funciona en `localhost:5173`
- [ ] El backend funciona en OpenRender
- [ ] La app funciona en producción (Firebase Hosting)
- [ ] El chat responde correctamente
- [ ] No hay errores en la consola
- [ ] El código está en GitHub

**¡Listo para añadir contenido emocional!** 🎉
