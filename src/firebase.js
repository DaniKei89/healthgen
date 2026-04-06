import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAdditionalUserInfo,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "TU_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "TU_PROYECTO.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "TU_PROYECTO",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "TU_PROYECTO.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000:web:000",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign-In
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Email Sign-Up
export const signUpWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Email Sign-In
export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Logout
export const logOut = () => signOut(auth);

// Auth state listener
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export { auth, db, storage, getAdditionalUserInfo };
export default app;
