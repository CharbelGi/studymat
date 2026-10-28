// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Importar Auth
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCubEQAAV3kzzjVesptQqtJzPBXCijX8c8",
  authDomain: "practica-f5dab.firebaseapp.com",
  projectId: "practica-f5dab",
  storageBucket: "practica-f5dab.firebasestorage.app",
  messagingSenderId: "288806024626",
  appId: "1:288806024626:web:37ba0006feb64e978220ab",
  measurementId: "G-DMVHYW1N5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
