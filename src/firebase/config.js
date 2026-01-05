// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// --- PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAgJs4czBYWqxW0yWW8pOSbo36VUAMfVKo",
  authDomain: "tienda-jenta.firebaseapp.com",
  projectId: "tienda-jenta",
  storageBucket: "tienda-jenta.firebasestorage.app",
  messagingSenderId: "278612581988",
  appId: "1:278612581988:web:61cd6104e07b9ddab54971",
};
// ---------------------------------------------

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas que usaremos
export const db = getFirestore(app); // Base de datos
export const auth = getAuth(app); // Login
export const storage = getStorage(app); // Fotos
