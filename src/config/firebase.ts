import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyCXisAo0yHUbKZ97H0Q_e02NNVVTjr712Q',
  authDomain: 'com.codesparks.shopite',
  projectId: 'shopite',
  storageBucket: 'shopite.firebasestorage.app',
  messagingSenderId: '123456789',
  appId: '1:510834056092:android:c44fc6f9b27ab0cdf00659',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
