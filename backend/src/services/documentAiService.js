import { env } from "../config/env.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey || process.env.GEMINI_API_KEY });

const OCR_JSON_SCHEMA = {
  type: "object",
  properties: {
    ocrText: { type: "string", description: "The complete extracted and summarized text from the document, clearly formatted with line breaks." },
    extractedRegulations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string", description: "The regulation code, e.g., 'CMR 2017 Reg 178' or 'DGMS Circular'" },
          requirement: { type: "string", description: "The specific compliance requirement extracted." }
        },
        required: ["code", "requirement"]
      },
      description: "A list of statutory regulations, rules, or standards mentioned or implied in the document."
    },
    extractedDeadline: { type: "string", description: "Any deadline date extracted from the document, e.g., '2026-09-15 (Quarterly Audit Submission)'. Return a plausible future deadline if none is explicitly stated." }
  },
  required: ["ocrText", "extractedRegulations", "extractedDeadline"]
};

export async function analyzeDocumentOcr({ fileName, entityType, base64Image }) {
  try {
    const prompt = `You are an expert AI Mining Compliance Auditor for the Directorate General of Mines Safety (DGMS).
Analyze the provided document/image. Extract the text, identify any statutory regulations, and find any compliance deadlines.
File Name: ${fileName || "Unknown"}
Entity Category: ${entityType || "General Compliance"}

Provide a highly detailed, realistic, and statutory-compliant extraction matching the exact JSON schema.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    
    // If a base64 image is passed, append it to the parts
    if (base64Image) {
      // Expecting base64Image to be like "data:image/png;base64,iVBORw0KGgo..."
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
        responseSchema: OCR_JSON_SCHEMA,
      }
    });

    const resultText = response.text;
    const selected = JSON.parse(resultText);

    return selected;
  } catch (error) {
    console.error("Gemini AI Document OCR Error:", error);
    throw new Error("Failed to process document with AI OCR.");
  }
}
