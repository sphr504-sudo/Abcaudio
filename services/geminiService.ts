import { GoogleGenAI, Type } from "@google/genai";
import { DirectorialResponse } from "../types";

/**
 * Aether Directorial Engine
 * Uses Gemini 3 Pro with deep reasoning (Thinking Mode) to analyze 
 * dramatic or narrative scripts and produce a nuanced performance map 
 * for browser-native synthesis.
 */
export const directPerformance = async (
  text: string, 
  feedback?: string, 
  previousThinking?: string
): Promise<DirectorialResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are the World-Class Neural Voice Director "Aether". 
  Your task is to take a raw text script and generate a hyper-nuanced "Vocal Performance Map".
  
  CORE MISSION:
  Transform flat text into a performance by using your THINKING budget (16k tokens) to:
  1. Analyze the hidden emotions (subtext), pacing needs, and narrative arc.
  2. Map these findings to specific pitch, rate, and volume values for every sentence.
  3. Identify which words need "emphasis" (stretching or stressing).
  
  DIRECTORIAL GUIDELINES:
  - PITCH: (0.5 to 2.0) - High for excitement/innocence, low for authority/despair.
  - RATE: (0.5 to 2.0) - Fast for anxiety/urgency, slow for gravitas/thoughtfulness.
  - VOLUME: (0.1 to 1.0) - Soft for intimacy/fear, loud for command/anger.
  - EMOTION: Be specific (e.g., "Cautious Curiosity", "Subdued Grief", "Vibrant Joy").
  
  If Feedback is provided: Adjust the performance to meet the user's specific directorial request.`;

  const userPrompt = feedback 
    ? `NEW SCRIPT: "${text}"\n\nDIRECTOR'S FEEDBACK: "${feedback}"\n\nPREVIOUS ANALYSIS: "${previousThinking}"\n\nDeliver a revised performance map.`
    : `SCRIPT: "${text}"\n\nPlease analyze and direct this performance.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingBudget: 16000 },
      maxOutputTokens: 20000, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thinkingProcess: { 
            type: Type.STRING, 
            description: "A summary of the character's motivation, the scene's subtext, and why you chose the specific directorial parameters." 
          },
          overallMood: { type: Type.STRING },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: "The exact sentence or phrase." },
                direction: {
                  type: Type.OBJECT,
                  properties: {
                    pitch: { type: Type.NUMBER },
                    rate: { type: Type.NUMBER },
                    volume: { type: Type.NUMBER },
                    emotion: { type: Type.STRING },
                    subtext: { type: Type.STRING, description: "What the character is REALLY feeling under these words." },
                    emphasis: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["pitch", "rate", "volume", "emotion", "subtext", "emphasis"]
                }
              },
              required: ["id", "text", "direction"]
            }
          }
        },
        required: ["thinkingProcess", "overallMood", "segments"]
      }
    }
  });

  const rawJson = response.text || "{}";
  return JSON.parse(rawJson);
};