// src/firebase.js

// Importa le funzioni necessarie dall'SDK modulare
import { initializeApp, getApps, getApp } from 'firebase/app'; // <-- Importa getApps e getApp
import { getAuth } from 'firebase/auth';
// Importa altri servizi se li usi nel frontend (Firestore, Storage, ecc.)
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// La tua configurazione copiata dalla console di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDzNwq9C4TyuMZLxo4j8efcT1CQuKhwExc",
  authDomain: "heptapod-park.firebaseapp.com",
  projectId: "heptapod-park",
  storageBucket: "heptapod-park.firebasestorage.app",
  messagingSenderId: "632304257562",
  appId: "1:632304257562:web:c332268c63e16deda11fa3",
  measurementId: "G-T73EPES5RW" // Questo è per Google Analytics, opzionale per l'auth
};

// Inizializza l'applicazione Firebase SOLO SE NON ESISTE GIÀ
let app; // Dichiara la variabile app fuori dal blocco if
if (!getApps().length) {
  // Se non ci sono app Firebase inizializzate, crea la nuova app
  app = initializeApp(firebaseConfig);
  console.log("Firebase Web SDK inizializzato per la prima volta.");
} else {
  // Se esiste già un'app (quella di default), recuperala
  app = getApp(); // getApp() senza nome restituisce l'app [DEFAULT]
  console.log("Firebase Web SDK già inizializzato, recupero l'istanza esistente.");
}

// Esporta le istanze dei servizi che userai nel frontend
export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

