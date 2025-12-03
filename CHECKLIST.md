# ✅ Checklist de Configuración y Despliegue

Usa este checklist para asegurarte de que todo está configurado correctamente antes del despliegue.

## 📦 Pre-Configuración

### Cuentas y Accesos
- [ ] Cuenta de GitHub creada
- [ ] Cuenta de Firebase creada
- [ ] Cuenta de OpenRouter creada con API key
- [ ] Cuenta de OpenRender creada (opcional)
- [ ] Node.js 18+ instalado localmente
- [ ] Git instalado y configurado

### API Keys
- [ ] API Key de OpenRouter obtenida (`sk-or-v1-...`)
- [ ] API Key guardada de forma segura (no en el código)

---

## 🔧 Configuración Local

### Instalación
- [ ] `npm install` ejecutado en la raíz
- [ ] `cd functions && npm install` ejecutado
- [ ] `cd server && npm install` ejecutado (si usas OpenRender)

### Variables de Entorno
- [ ] Archivo `.env` creado en la raíz
- [ ] `VITE_OPENROUTER_API_KEY` configurada en `.env`
- [ ] `VITE_OPENROUTER_MODEL` configurada (opcional)
- [ ] `VITE_FIREBASE_FUNCTIONS_URL` configurada (si usas Firebase Functions)

### Verificación Local
- [ ] `npm run dev` funciona sin errores
- [ ] `npm run build` se ejecuta correctamente
- [ ] La aplicación se ve correctamente en `localhost:3000`
- [ ] No hay errores en la consola del navegador

---

## 🐙 GitHub

### Repositorio
- [ ] Repositorio creado en GitHub
- [ ] `.gitignore` verificado (incluye `.env`, `node_modules/`, `dist/`)
- [ ] Código subido a GitHub
- [ ] README.md actualizado con información del proyecto

### Seguridad
- [ ] `.env` NO está en el repositorio
- [ ] API keys NO están en el código
- [ ] `.gitignore` está funcionando correctamente

---

## 🔥 Firebase

### Configuración Inicial
- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Login en Firebase (`firebase login`)
- [ ] Proyecto Firebase creado o seleccionado
- [ ] `.firebaserc` actualizado con el Project ID correcto

### Firebase Hosting
- [ ] `firebase init` ejecutado (seleccionado Hosting)
- [ ] Directorio público configurado como `dist`
- [ ] `firebase.json` verificado

### Firebase Functions
- [ ] `firebase init` ejecutado (seleccionado Functions)
- [ ] API Key configurada en Functions:
  - [ ] Método antiguo: `firebase functions:config:set openrouter.api_key="..."`
  - [ ] O método nuevo: `firebase functions:secrets:set OPENROUTER_API_KEY`
- [ ] Functions compiladas sin errores

### Despliegue
- [ ] `npm run build` ejecutado exitosamente
- [ ] `npm run deploy:hosting` ejecutado
- [ ] `npm run deploy:functions` ejecutado (si usas Functions)
- [ ] URL de producción verificada: `https://TU_PROJECT_ID.web.app`
- [ ] La aplicación funciona en producción

---

## 🌐 OpenRender (Opcional)

### Configuración
- [ ] Cuenta de OpenRender creada
- [ ] Repositorio de GitHub conectado
- [ ] `render.yaml` verificado
- [ ] Variables de entorno configuradas en OpenRender:
  - [ ] `OPENROUTER_API_KEY`
  - [ ] `NODE_ENV=production`

### Despliegue
- [ ] Servicio desplegado en OpenRender
- [ ] Health check funcionando: `https://tu-servicio.onrender.com/health`
- [ ] Proxy funcionando: `POST /openrouter-proxy`
- [ ] URL actualizada en `.env` del frontend

---

## 🧪 Pruebas Finales

### Funcionalidad
- [ ] La aplicación carga correctamente
- [ ] El chat se muestra correctamente
- [ ] Se puede enviar un mensaje
- [ ] Se recibe respuesta del LLM
- [ ] No hay errores en la consola
- [ ] El dashboard de riesgos funciona (botón ⚠️)

### Seguridad
- [ ] API keys no están expuestas en el código del cliente
- [ ] CORS configurado correctamente
- [ ] Errores manejados apropiadamente

### Performance
- [ ] La aplicación carga rápido
- [ ] Los mensajes se procesan en tiempo razonable
- [ ] No hay memory leaks evidentes

---

## 📝 Documentación

- [ ] README.md completo y actualizado
- [ ] DEPLOY.md con instrucciones claras
- [ ] SETUP.md con guía de configuración
- [ ] CONTRIBUTING.md con áreas pendientes

---

## 🚨 Problemas Comunes - Verificación

### Si hay errores de API Key:
- [ ] Verifica que `.env` existe y tiene la variable correcta
- [ ] Reinicia el servidor de desarrollo
- [ ] Verifica que la variable empieza con `VITE_`

### Si hay errores de CORS:
- [ ] Verifica que CORS está configurado en el backend
- [ ] Verifica que el origen está permitido
- [ ] Verifica que la URL del backend es correcta

### Si Functions no funcionan:
- [ ] Verifica que la API key está configurada
- [ ] Verifica los logs: `firebase functions:log`
- [ ] Verifica que Node.js 18 está configurado

---

## ✅ Listo para Producción

Cuando todos los items estén marcados:
- [ ] La aplicación está desplegada
- [ ] Todo funciona correctamente
- [ ] Documentación completa
- [ ] Listo para añadir contenido emocional

---

**Última verificación:** _______________
**Verificado por:** _______________

