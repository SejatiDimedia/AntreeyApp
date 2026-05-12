import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project credentials
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDzFdk3FbZl4WGguqhc3jpcCFvQd_lRJYQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0022008781.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0022008781",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0022008781.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "498809238217",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:498809238217:web:f17806ec34bb98a1a21318"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
const rawFirestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
const normalizedFirestoreDatabaseId =
  rawFirestoreDatabaseId &&
  rawFirestoreDatabaseId !== '(default)' &&
  rawFirestoreDatabaseId !== 'default'
    ? rawFirestoreDatabaseId
    : '';

export const db = normalizedFirestoreDatabaseId
  ? getFirestore(app, normalizedFirestoreDatabaseId)
  : getFirestore(app);

export default app;
