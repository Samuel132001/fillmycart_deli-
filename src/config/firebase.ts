import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyCUCERBNpaLd4zaC_N6GAiIDytRT2OfEbk",
  authDomain: "rusticpallete.firebaseapp.com",
  databaseURL: "https://rusticpallete-default-rtdb.firebaseio.com",
  projectId: "rusticpallete",
  storageBucket: "rusticpallete.firebasestorage.app",
  messagingSenderId: "649653685969",
  appId: "1:649653685969:web:599bc64ba839045518bff0",
  measurementId: "G-E77XE4YKDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
