import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fixJsonWithGemini = async (brokenJson: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a JSON repair expert. Fix the following broken JSON string. Return ONLY the valid JSON string without any markdown formatting or code blocks.
      
      Broken JSON:
      ${brokenJson}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Fix JSON Error:", error);
    throw error;
  }
};

export const generateJsonWithGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a JSON object based on this description: "${prompt}". Return ONLY the JSON.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Generate JSON Error:", error);
    throw error;
  }
};