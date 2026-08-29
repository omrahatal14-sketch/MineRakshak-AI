import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try loading from root (.env) and local backend (.env)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "minerakshak-ai",
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(__dirname, "../../../firebase/service-account.json"),
};
