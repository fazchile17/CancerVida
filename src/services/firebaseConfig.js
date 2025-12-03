/**
 * Configuración de Firebase y Firestore
 * 
 * Inicializa Firebase App y exporta la instancia de Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase desde variables de entorno
// Valores por defecto basados en la configuración del proyecto
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBWkhBllIRTVaIp5yqNYbqBd8e_yhVEKJE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cancervida-7db4b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cancervida-7db4b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cancervida-7db4b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '422727359538',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:422727359538:web:1677d320ca800e38e1702b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-QMSWPP3300' // Opcional para Analytics
};

// Inicializar Firebase App
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Si ya está inicializado, usar la instancia existente
  if (error.code === 'app/duplicate-app') {
    app = initializeApp.getApp();
  } else {
    console.error('Error inicializando Firebase:', error);
    throw error;
  }
}

// Inicializar Firestore
export const db = getFirestore(app);

// Exportar app por si se necesita
export default app;

