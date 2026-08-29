import { env } from "../config/env.js";

async function post(path, body) {
  const res = await fetch(`${env.aiServiceUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI service ${path} failed: ${res.status}`);
  return res.json();
}

export const aiClient = {
  scoreRisk: (mineId) => post("/risk-score", { mineId }),
  detectAnomalies: (mineId) => post("/anomaly-detection", { mineId }),
  prioritizeInspections: () => post("/prioritization", {}),
};
