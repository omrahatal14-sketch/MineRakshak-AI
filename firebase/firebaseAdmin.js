import { readFileSync, existsSync } from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./service-account.json";

if (!getApps().length) {
  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    try {
      initializeApp();
    } catch (err) {
      console.warn("Firebase Admin initialized without service account:", err.message);
    }
  }
}

export const auth = getAuth();
export const db = getFirestore();
