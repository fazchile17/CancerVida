# 🔥 Configurar Firestore para Almacenar Datos

Esta guía te ayudará a configurar Firestore para que tu aplicación pueda almacenar datos (usuarios, chats, mensajes, logs de riesgo).

## 📋 Pasos para Configurar Firestore

### Paso 1: Crear la Base de Datos en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **cancervida-7db4b**
3. En el menú lateral izquierdo, haz clic en **Firestore Database**
4. Si es la primera vez, verás un botón **"Crear base de datos"**
5. Haz clic en **"Crear base de datos"**

### Paso 2: Elegir el Modo de Seguridad

1. Te preguntará en qué modo iniciar:
   - **Selecciona: "Modo de pruebas"** (Test mode)
   - Esto permitirá lectura/escritura durante 30 días (suficiente para desarrollo)
   - ⚠️ **IMPORTANTE**: Después de 30 días, Firebase te pedirá actualizar las reglas

2. Selecciona la ubicación de la base de datos:
   - Recomendado: **us-central** o **southamerica-east1** (más cerca de Chile)
   - Haz clic en **"Habilitar"**

### Paso 3: Desplegar las Reglas de Seguridad

Las reglas ya están configuradas en `firestore.rules`. Solo necesitas desplegarlas:

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:rules
```

O si prefieres desplegar todo:

```bash
firebase deploy
```

### Paso 4: Verificar la Configuración

1. En Firebase Console, ve a **Firestore Database** > **Reglas**
2. Deberías ver las reglas que permiten lectura/escritura en modo pruebas
3. Verifica que las reglas coincidan con `firestore.rules` en tu proyecto

## ✅ Estructura de Datos en Firestore

Una vez configurado, Firestore almacenará datos en esta estructura:

```
users/
  {userId}/
    - email: string
    - name: string
    - createdAt: timestamp
    - lastActiveAt: timestamp

chats/
  {chatId}/
    - userId: string
    - name: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - messageCount: number
    messages/
      {messageId}/
        - text: string
        - isUser: boolean
        - timestamp: timestamp
        - userId: string

riskLogs/
  {logId}/
    - userId: string
    - chatId: string
    - userMessage: string
    - llmResponse: string
    - riskLevel: string
    - riskScore: number
    - wasBlocked: boolean
    - timestamp: timestamp
```

## 🧪 Probar que Funciona

1. Ejecuta tu aplicación en desarrollo:
   ```bash
   npm run dev
   ```

2. Crea un usuario desde la interfaz
3. Envía un mensaje en el chat
4. Ve a Firebase Console > Firestore Database > **Datos**
5. Deberías ver las colecciones `users`, `chats`, `messages`, `riskLogs` con datos

## ⚠️ Notas Importantes

### Modo Pruebas vs Producción

- **Modo Pruebas**: Permite lectura/escritura sin autenticación (actual)
- **Producción**: Requiere autenticación y reglas más estrictas

### Límite de 30 Días

Firebase te notificará cuando se acerque el límite de 30 días del modo pruebas. Para extenderlo:

1. Ve a Firestore Database > **Reglas**
2. Haz clic en **"Publicar"** (aunque no cambies nada)
3. Esto extiende el modo pruebas por otros 30 días

### Reglas de Seguridad

Las reglas actuales (`firestore.rules`) permiten todo en modo pruebas. Para producción, deberías:

1. Implementar autenticación de Firebase
2. Restringir las reglas para que solo los usuarios autenticados puedan leer/escribir sus propios datos

## 🔍 Verificar que Está Funcionando

### Desde la Consola de Firebase:

1. Ve a **Firestore Database** > **Datos**
2. Deberías ver las colecciones cuando uses la app

### Desde el Código:

Abre la consola del navegador (F12) y busca:
- ✅ "Firebase inicializado correctamente"
- ❌ NO deberías ver errores de permisos

### Errores Comunes:

1. **"Missing or insufficient permissions"**
   - Solución: Despliega las reglas con `firebase deploy --only firestore:rules`

2. **"Firestore has not been initialized"**
   - Solución: Verifica que las variables de entorno de Firebase estén configuradas

3. **"The database does not exist"**
   - Solución: Crea la base de datos desde Firebase Console (Paso 1)

## 📝 Comandos Útiles

```bash
# Desplegar solo las reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar reglas e índices
firebase deploy --only firestore

# Ver el estado de Firestore
firebase firestore:indexes

# Ver las reglas actuales
firebase firestore:rules
```

## 🎯 Checklist de Configuración

- [ ] Base de datos Firestore creada en Firebase Console
- [ ] Modo pruebas habilitado
- [ ] Reglas de Firestore desplegadas (`firebase deploy --only firestore:rules`)
- [ ] Variables de entorno configuradas en `.env` (o usando valores por defecto)
- [ ] Aplicación probada creando un usuario y enviando mensajes
- [ ] Datos visibles en Firebase Console > Firestore Database > Datos

## 🚀 Siguiente Paso

Una vez configurado Firestore, tu aplicación podrá:
- ✅ Guardar usuarios
- ✅ Guardar chats y mensajes
- ✅ Guardar logs de riesgo
- ✅ Mantener persistencia de datos entre sesiones

¡Listo! Tu aplicación ahora puede almacenar datos en Firestore.

