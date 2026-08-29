import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envDir: "../", // Load .env from project root
  server: { port: 5173, host: true },
});
