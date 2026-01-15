// C:\meunovoprojeto\conselhotutelar-app\AppConselhoTutelarRN\firebase.js

// Importações e Lógica de Configuração (IDÊNTICA ao que estava em firebaseconfig.js)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth'; 
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBdpqy-mSalIwUvFxJQkol3lMuL5mHTCrs",
    authDomain: "meu-app-conselho-tutelar.firebaseapp.com",
    projectId: "meu-app-conselho-tutelar",
    storageBucket: "meu-app-conselho-tutelar.firebasestorage.app",
    messagingSenderId: "310189207398",
    appId: "1:310189207398:web:84ebecb0b633c1499662a7",
    measurementId: "G-FMYTZP53WM"
};


// 1. Inicializa o App
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp(); 
}

// 2. Inicializa o Auth com persistência garantida
let auth;
try {
    auth = getAuth(app); 
} catch (e) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage) 
    });
}

// 3. Inicializa o Firestore
const db = getFirestore(app);

// 4. Exportar
export { auth, db, app };