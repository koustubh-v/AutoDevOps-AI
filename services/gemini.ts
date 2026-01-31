
import { GoogleGenAI } from "@google/genai";

// Always use a named parameter for apiKey and direct access to process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAgentReasoning = async (context: string) => {
  try {
    // Correctly call generateContent with model and contents in one go
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an autonomous DevOps agent named AutoDevOps AI. 
      Generate a concise technical reasoning log entry for the following situation: ${context}.
      Format it as a professional engineer's internal thought process. Keep it under 60 words.`,
    });
    // response.text is a property, not a method
    return response.text || "Analyzing system state...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analyzing codebase structure and potential failure vectors...";
  }
};
