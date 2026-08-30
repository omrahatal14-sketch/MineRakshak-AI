import { env } from "../config/env.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey || process.env.GEMINI_API_KEY });

const HAZARD_JSON_SCHEMA = {
  type: "object",
  properties: {
    detectedHazard: { type: "string", description: "A concise title of the identified hazard." },
    category: { type: "string", description: "Category (e.g., Safety, Structural, Environmental, Heavy Machinery, Haul Road)" },
    severity: { type: "string", description: "Severity level (critical, high, medium, low)" },
    confidence: { type: "number", description: "Confidence score between 0.0 and 1.0" },
    description: { type: "string", description: "Detailed description of the hazard and why it is a risk." },
    recommendations: { type: "string", description: "Actionable step-by-step recommendations to fix the hazard." },
    suggestedDeadlineDays: { type: "integer", description: "Number of days within which this must be resolved based on severity." },
    riskScore: { type: "number", description: "Risk score from 0 to 100." },
    riskLevel: { type: "string", description: "Risk level (high, medium, low)." },
    suggestedResponsibleParty: { type: "string", description: "The type of contractor or internal team responsible for fixing this." }
  },
  required: [
    "detectedHazard", "category", "severity", "confidence", "description", 
    "recommendations", "suggestedDeadlineDays", "riskScore", "riskLevel", "suggestedResponsibleParty"
  ]
};

export async function analyzeHazardVision({ fileName, contextText, mineId, base64Image }) {
  try {
    const prompt = `You are an expert AI Mining Safety Inspector for the Directorate General of Mines Safety (DGMS).
Analyze the provided information and image (if provided) regarding a potential mining hazard.
File Name: ${fileName || "Unknown"}
Context: ${contextText || "No context provided"}
Mine ID: ${mineId || "Unknown"}

Provide a highly detailed, realistic, and statutory-compliant hazard assessment matching the exact JSON schema.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    
    // If a base64 image is passed, append it to the parts
    if (base64Image) {
      // Expecting base64Image to be like "data:image/jpeg;base64,/9j/4AAQSk..."
      const mimeTypeMatch = base64Image.match(/^data:(.*?);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = base64Image.replace(/^data:.*?;base64,/, "");
      
      contents[0].parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: HAZARD_JSON_SCHEMA,
      }
    });

    const resultText = response.text;
    const selected = JSON.parse(resultText);

    const now = new Date();
    const deadlineDate = new Date(now.getTime() + selected.suggestedDeadlineDays * 86400000);
    const deadlineStr = deadlineDate.toISOString().split("T")[0];

    return {
      ...selected,
      calculatedDeadline: deadlineStr,
      deadlineFormatted:
        selected.suggestedDeadlineDays <= 2
          ? `${selected.suggestedDeadlineDays * 24} Hours (${deadlineStr})`
          : `${selected.suggestedDeadlineDays} Days (${deadlineStr})`,
      analyzedAt: now.toISOString(),
    };
  } catch (error) {
    console.error("Gemini AI Hazard Vision Error:", error);
    throw new Error("Failed to analyze hazard with AI.");
  }
}
