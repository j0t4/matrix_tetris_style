import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMatchCommentary = async (
  p1Name: string,
  p1Score: number,
  p2Name: string,
  p2Score: number,
  gameTimeSeconds: number
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an AI observer in the Matrix (like Agent Smith or the Architect).
      You are watching a digital battle (Tetris) between two programs:
      Program 1: ${p1Name} (Score: ${p1Score})
      Program 2: ${p2Name} (Score: ${p2Score})
      
      Match Duration: ${gameTimeSeconds} seconds.
      
      Provide a single, cryptic, 1-sentence commentary on the current state of the simulation. 
      Focus on efficiency, anomalies, or the inevitability of calculation.
      Do not mention "Tetris" directly, call it "block alignment" or "data stacking".
      If the scores are close, mention the symmetry.
      If one is winning by a lot, mention the superiority of their algorithm.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Connection interrupted...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System Signal Lost. Reconnecting...";
  }
};
