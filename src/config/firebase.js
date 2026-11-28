import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCubEQAAV3kzzjVesptQqtJzPBXCijX8c8',
  authDomain: 'practica-f5dab.firebaseapp.com',
  projectId: 'practica-f5dab',
  storageBucket: 'practica-f5dab.firebasestorage.app',
  messagingSenderId: '288806024626',
  appId: '1:288806024626:web:37ba0006feb64e978220ab',
  measurementId: 'G-DMVHYW1N5L',
};

export const app = initializeApp(firebaseConfig);

// La sesión se guarda en el navegador y sigue activa sin red
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Caché persistente: Firestore guarda en IndexedDB lo que lee y lo que
// escribe sin red, y lo envía solo cuando vuelve la conexión
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});