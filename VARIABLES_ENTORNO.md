# Variables de Entorno - CancerVidaBot

Este documento explica todas las variables de entorno que deben configurarse en el archivo `.env`.

## 📋 Archivo .env

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

## 🔧 Variables Requeridas

### 1. Configuración de OpenAI / Backend

#### Opción A: Usar Backend Proxy (RECOMENDADO)

```env
# URL del backend desplegado en OpenRender
VITE_BACKEND_URL=https://cancervida.onrender.com

# Modelo de OpenAI a usar
VITE_OPENAI_MODEL=gpt-4o-mini
```

**Nota**: Si usas `VITE_BACKEND_URL`, NO necesitas `VITE_OPENAI_API_KEY` porque el backend maneja la API key de forma segura.

#### Opción B: Usar OpenAI Directamente (NO RECOMENDADO)

```env
# API Key de OpenAI (solo si NO usas backend proxy)
VITE_OPENAI_API_KEY=sk-tu-api-key-aqui

# Modelo de OpenAI a usar
VITE_OPENAI_MODEL=gpt-4o-mini
```

**⚠️ ADVERTENCIA**: Exponer la API key en el cliente es un riesgo de seguridad. Solo úsalo para desarrollo local.

### 2. Configuración de Firebase (Requerido para Firestore)

```env
# API Key de Firebase
VITE_FIREBASE_API_KEY=AIzaSyBWkhBllIRTVaIp5yqNYbqBd8e_yhVEKJE

# Auth Domain
VITE_FIREBASE_AUTH_DOMAIN=cancervida-7db4b.firebaseapp.com

# Project ID (ya tiene valor por defecto)
VITE_FIREBASE_PROJECT_ID=cancervida-7db4b

# Storage Bucket
VITE_FIREBASE_STORAGE_BUCKET=cancervida-7db4b.firebasestorage.app

# Messaging Sender ID
VITE_FIREBASE_MESSAGING_SENDER_ID=422727359538

# App ID
VITE_FIREBASE_APP_ID=1:422727359538:web:1677d320ca800e38e1702b

# Measurement ID (opcional, para Analytics)
VITE_FIREBASE_MEASUREMENT_ID=G-QMSWPP3300
```

## 📝 Ejemplo Completo de .env

```env
# ============================================
# CONFIGURACIÓN DE OPENAI / BACKEND
# ============================================

# Backend proxy (recomendado)
VITE_BACKEND_URL=https://cancervida.onrender.com
VITE_OPENAI_MODEL=gpt-4o-mini

# Si NO usas backend proxy, descomenta esto:
# VITE_OPENAI_API_KEY=sk-tu-api-key-aqui

# ============================================
# CONFIGURACIÓN DE FIREBASE
# ============================================
# NOTA: Estos valores ya están configurados por defecto en el código
# Puedes dejarlos vacíos o usar estos valores específicos

VITE_FIREBASE_API_KEY=AIzaSyBWkhBllIRTVaIp5yqNYbqBd8e_yhVEKJE
VITE_FIREBASE_AUTH_DOMAIN=cancervida-7db4b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cancervida-7db4b
VITE_FIREBASE_STORAGE_BUCKET=cancervida-7db4b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=422727359538
VITE_FIREBASE_APP_ID=1:422727359538:web:1677d320ca800e38e1702b
VITE_FIREBASE_MEASUREMENT_ID=G-QMSWPP3300
```

## 🔍 Dónde Obtener los Valores

### Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (`cancervida-7db4b`)
3. Ve a **Project Settings** (⚙️) > **General**
4. En la sección **Your apps**, busca tu app web o crea una nueva
5. Copia los valores del objeto `firebaseConfig`

Ejemplo de lo que verás (valores reales de tu proyecto):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBWkhBllIRTVaIp5yqNYbqBd8e_yhVEKJE",
  authDomain: "cancervida-7db4b.firebaseapp.com",
  projectId: "cancervida-7db4b",
  storageBucket: "cancervida-7db4b.firebasestorage.app",
  messagingSenderId: "422727359538",
  appId: "1:422727359538:web:1677d320ca800e38e1702b",
  measurementId: "G-QMSWPP3300" // Opcional para Analytics
};
```

**✅ Buenas noticias**: Estos valores ya están configurados por defecto en `src/services/firebaseConfig.js`, así que **NO necesitas** añadirlos al `.env` a menos que quieras sobrescribirlos.

### OpenAI

- **API Key**: Obténla desde [OpenAI API Keys](https://platform.openai.com/api-keys)
- **Modelo**: Usa `gpt-4o-mini` (recomendado) o cualquier otro modelo disponible

### Backend URL

- Si ya tienes el backend desplegado en OpenRender, usa esa URL
- Formato: `https://tu-servicio.onrender.com`

## ⚠️ Importante

1. **NUNCA** commitees el archivo `.env` al repositorio (ya está en `.gitignore`)
2. Todas las variables deben empezar con `VITE_` para que Vite las exponga al cliente
3. Si usas `VITE_BACKEND_URL`, NO necesitas `VITE_OPENAI_API_KEY`
4. **Los valores de Firebase ya están configurados por defecto** en el código, así que puedes:
   - Omitir las variables de Firebase en el `.env` (usará los valores por defecto)
   - O incluirlas si quieres sobrescribirlos
5. El `storageBucket` usa el formato `.firebasestorage.app` (nuevo formato de Firebase)

## 🚀 Para Producción

En producción (Firebase Hosting, OpenRender, etc.), configura estas variables en:
- **Firebase Hosting**: Variables de entorno en Firebase Console
- **OpenRender**: Variables de entorno en el dashboard del servicio
- **Vercel/Netlify**: Variables de entorno en el dashboard

## 📋 Checklist

- [ ] Archivo `.env` creado en la raíz del proyecto
- [ ] `VITE_BACKEND_URL` configurado (o `VITE_OPENAI_API_KEY` si no usas proxy)
- [ ] `VITE_OPENAI_MODEL` configurado
- [ ] Variables de Firebase (opcionales, ya tienen valores por defecto)
- [ ] Archivo `.env` NO está en el repositorio (verificado con `git status`)

## 🎯 Configuración Mínima Requerida

**Para que el proyecto funcione, solo necesitas:**

```env
# Mínimo requerido
VITE_BACKEND_URL=https://cancervida.onrender.com
VITE_OPENAI_MODEL=gpt-4o-mini
```

**Las variables de Firebase son opcionales** porque ya están configuradas por defecto en el código con los valores de tu proyecto.

