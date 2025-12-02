import { GoogleGenAI } from "@google/genai";
import { DeviceType } from "../types";

const initGenAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export const analyzeIssue = async (deviceType: DeviceType, issueDescription: string): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "AI Service Unavailable: API Key missing.";

  try {
    const prompt = `
      You are an expert IT technician.
      Device: ${deviceType}
      Issue: ${issueDescription}
      
      Please provide:
      1. A list of potential causes.
      2. Recommended diagnostic steps.
      3. Estimated difficulty (Low/Medium/High).
      
      Keep it concise, professional, and helpful for a repair technician.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating analysis. Please try again.";
  }
};