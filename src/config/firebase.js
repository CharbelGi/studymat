import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCubEQAAV3kzzjVesptQqtJzPBXCijX8c8",
  authDomain: "practica-f5dab.firebaseapp.com",
  projectId: "practica-f5dab",
  storageBucket: "practica-f5dab.firebasestorage.app",
  messagingSenderId: "288806024626",
  appId: "1:288806024626:web:37ba0006feb64e978220ab",
  measurementId: "G-DMVHYW1N5L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();