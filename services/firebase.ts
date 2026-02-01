
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAV6SUCoVMI8gl7wjCh6_LyKQzHq1CuW00",
  authDomain: "autodevops-ai-d9849.firebaseapp.com",
  projectId: "autodevops-ai-d9849",
  storageBucket: "autodevops-ai-d9849.firebasestorage.app",
  messagingSenderId: "786087945764",
  appId: "1:786087945764:web:0650aac66fe2e4d8c2dab1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
