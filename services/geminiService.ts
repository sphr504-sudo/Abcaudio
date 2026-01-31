
import { GoogleGenAI, Type } from "@google/genai";
import { DirectorialResponse } from "../types";

/**
 * Uses Gemini 3 Pro's reasoning capabilities to analyze text and 
 * create a highly nuanced "vocal performance map" for a browser's 
 * synthesis engine to execute.
 */
export const directPerformance = async (
  text: string, 
  feedback?: string, 
  previousThinking?: string
): Promise<DirectorialResponse> => {
  // Initialize AI client right before making an API call to ensure it always uses the latest API key from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are a World-Class Voice Director. 
  Your goal is to take raw text and produce a "Performance Map" for a synthesis engine.
  
  You must use your THINKING budget to:
  1. Analyze the emotional arc of the text.
  2. Identify subtext, irony, or hidden feelings.
  3. Determine precise pitch, rate, and volume adjustments for every sentence.
  
  If feedback is provided, adjust the performance specifically based on that critique.
  If previous thinking is provided, evolve from it rather than starting over.`;

  const userPrompt = feedback 
    ? `TEXT: "${text}"\n\nFEEDBACK: "${feedback}"\n\nPREVIOUS THINKING: "${previousThinking}"\n\nDirect a new version.`
    : `TEXT: "${text}"\n\nDirect the performance.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingBudget: 16000 },
      maxOutputTokens: 20000, // Reserve budget for both thinking and JSON
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thinkingProcess: { 
            type: Type.STRING, 
            description: "A detailed summary of your internal reasoning about the character's motivation and the text's mood." 
          },
          overallMood: { type: Type.STRING },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                direction: {
                  type: Type.OBJECT,
                  properties: {
                    pitch: { type: Type.NUMBER, description: "Pitch value between 0.5 (deep) and 2.0 (high). Neutral is 1.0." },
                    rate: { type: Type.NUMBER, description: "Rate value between 0.5 (slow) and 2.0 (fast). Neutral is 1.0." },
                    volume: { type: Type.NUMBER, description: "Volume between 0.1 and 1.0." },
                    emotion: { type: Type.STRING },
                    subtext: { type: Type.STRING, description: "The internal state of the character during this specific line." },
                    emphasis: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific words in the segment to emphasize." }
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
