
import { GoogleGenAI } from "@google/genai";

// Fix: Always use the process.env.API_KEY directly as a named parameter in the constructor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEncroachment = async (description: string, imageUrl?: string) => {
  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning task of encroachment verification
    const model = 'gemini-3-pro-preview';
    const parts: any[] = [{ text: `Act as a Government Land Monitoring AI. Analyze this complaint and photo to verify if it looks like land encroachment. Complaint: "${description}". Provide a risk score (0-100) and a brief reasoning.` }];
    
    if (imageUrl) {
      // In a real app, we'd fetch the image and convert to base64
      // For this demo, we use a text-only prompt if image processing is complex
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
    });

    // Fix: Access .text property directly, do not call as a method
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Verification currently unavailable. Proceeding with manual inspection.";
  }
};

export const detectConstructionChanges = async (coordinates: string) => {
  // Fix: Using gemini-3-pro-preview for advanced satellite analysis reasoning
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Compare hypothetical satellite imagery for coordinates ${coordinates} over the last 6 months. Flag any suspicious vegetation clearing or foundation pouring. Return findings in a structured format.`,
  });
  // Fix: Access .text property directly
  return response.text;
};
