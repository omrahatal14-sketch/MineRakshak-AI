import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const sanitize = (val) => (val ? String(val).replace(/^[",'\s]+|[",'\s]+$/g, "").trim() : "");

const apiKey = sanitize(import.meta.env.VITE_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: apiKey && apiKey !== "" ? apiKey : "AIzaSyDummyKeyForInitialDevUiLoad12345",
  authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "minerakshak-ai.firebaseapp.com",
  projectId: sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "minerakshak-ai",
  storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "minerakshak-ai.firebasestorage.app",
  messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "846866429131",
  appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID) || "1:846866429131:web:1e83863b25d84cf4b1574e",
};

let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (err) {
  console.warn("Firebase initialization notice:", err.message);
  app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: "AIzaSyDummyKeyForInitialDevUiLoad12345",
        projectId: "minerakshak-ai",
      });
}

export const firebaseApp = app;
export const firebaseAuth = getAuth(firebaseApp);

let storage;
try {
  storage = getStorage(firebaseApp);
} catch (e) {
  console.warn("Firebase storage init notice:", e.message);
  storage = null;
}
export const firebaseStorage = storage;
