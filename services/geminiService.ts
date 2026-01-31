import { GoogleGenAI, Type } from "@google/genai";
import { DirectorialResponse } from "../types";

export const directPerformance = async (
  text: string, 
  feedback?: string, 
  previousThinking?: string
): Promise<DirectorialResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are "SHROTA STUDIO", the world's most advanced neural performance director. 
  Your mission is to analyze scripts and provide hyper-detailed directorial data for high-fidelity synthesis.

  CORE CAPABILITIES:
  1. DEMOGRAPHIC DETECTION: Identify every speaker in the text. Categorize them as: 'Man', 'Old Man', 'Woman', 'Boy Kid', 'Girl Kid', 'Newborn Baby', or 'Paranormal Ghost'.
  2. EMOTION ENGINE: Detect the current emotional state of each line: 'Fear', 'Happy', 'Excited', 'Love', 'Emotional', 'Despair', 'Authoritative', or 'Neutral'.
  3. PERFORMANCE MAPPING: Assign exact Pitch (0.5-2.0), Rate (0.5-2.0), and Volume (0.1-1.0) values.
     - Paranormal Ghost: Low pitch, very slow rate, airy volume.
     - Newborn: High pitch, erratic rate.
     - Old Man: Lower pitch, gravelly, slower rate.
     - Kids: Higher pitch, high energy.
  4. STORY TRACKING: Maintain context. If a character is crying, the volume and rate should reflect that throughout the scene.

  THINKING REQUIREMENT:
  Use your thinking budget to deeply parse subtext. Don't just look at the words; look at the SILENCE between them. Identify the "Breath" of the scene.`;

  const userPrompt = feedback 
    ? `SCRIPT: "${text}"\n\nDIRECTOR'S NOTES: "${feedback}"\n\nPREVIOUS LOG: "${previousThinking}"\n\nRefine the performance map.`
    : `SCRIPT: "${text}"\n\nPlease perform full neural analysis and character assignment.`;

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
          thinkingProcess: { type: Type.STRING },
          overallMood: { type: Type.STRING },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                demographic: { type: Type.STRING, enum: ['Man', 'Old Man', 'Woman', 'Boy Kid', 'Girl Kid', 'Newborn Baby', 'Paranormal Ghost'] }
              },
              required: ["id", "name", "demographic"]
            }
          },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                characterId: { type: Type.STRING },
                text: { type: Type.STRING },
                direction: {
                  type: Type.OBJECT,
                  properties: {
                    pitch: { type: Type.NUMBER },
                    rate: { type: Type.NUMBER },
                    volume: { type: Type.NUMBER },
                    emotion: { type: Type.STRING, enum: ['Fear', 'Happy', 'Excited', 'Love', 'Emotional', 'Despair', 'Authoritative', 'Neutral'] },
                    subtext: { type: Type.STRING },
                    emphasis: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["pitch", "rate", "volume", "emotion", "subtext", "emphasis"]
                }
              },
              required: ["id", "characterId", "text", "direction"]
            }
          }
        },
        required: ["thinkingProcess", "overallMood", "characters", "segments"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};