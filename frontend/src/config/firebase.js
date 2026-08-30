import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || "demo-api-key",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "minerakshak-ai.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "minerakshak-ai",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "minerakshak-ai.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "1234567890",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || "1:1234567890:web:abcdef",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
let storageInstance = null;
try {
  storageInstance = getStorage(firebaseApp);
} catch (e) {}
export const firebaseStorage = storageInstance;
