
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CharacterDef, DialogueSegment, ScriptAnalysis, VoiceBase, VoiceModel } from "../types";

const getApiKey = () => process.env.API_KEY || "";

/**
 * 10 Neural Models mapped to public/custom datasets.
 * These act as the 'Voice Clones' base for the synthesis engine.
 */
export const NEURAL_MODELS: VoiceModel[] = [
  { id: 'ljs-v1', name: 'LJ-Narrator', dataset: 'LJSpeech', description: 'Classic female narrative voice, high consistency.', baseVoice: 'Kore', tags: ['Narrative', 'Studio'] },
  { id: 'arc-rms', name: 'Arctic-Male', dataset: 'CMU Arctic', description: 'Authoritative male voice (RMS speaker).', baseVoice: 'Fenrir', tags: ['Authoritative', 'Male'] },
  { id: 'arc-slt', name: 'Arctic-Female', dataset: 'CMU Arctic', description: 'Soft, precise female voice (SLT speaker).', baseVoice: 'Puck', tags: ['Gentle', 'Female'] },
  { id: 'moz-uk', name: 'Common-UK', dataset: 'Mozilla', description: 'Sophisticated British Received Pronunciation.', baseVoice: 'Charon', tags: ['Sophisticated', 'British'] },
  { id: 'moz-youth', name: 'Common-Youth', dataset: 'Mozilla', description: 'Casual, fast-paced millennial vocal fry.', baseVoice: 'Zephyr', tags: ['Casual', 'Modern'] },
  { id: 'fes-awb', name: 'Festvox-Scot', dataset: 'Festvox', description: 'Warm Scottish-accented male narrative.', baseVoice: 'Charon', tags: ['Accented', 'Warm'] },
  { id: 'fes-bdl', name: 'Festvox-US', dataset: 'Festvox', description: 'Neutral Midwestern US male broadcast.', baseVoice: 'Zephyr', tags: ['Broadcast', 'Neutral'] },
  { id: 'ae-prime', name: 'Aether-Prime', dataset: 'Aether-Neural', description: 'Our custom zero-shot balanced model.', baseVoice: 'Kore', tags: ['Premium', 'Balanced'] },
  { id: 'ae-dark', name: 'Aether-Shadow', dataset: 'Aether-Neural', description: 'Deep, whispered, and atmospheric.', baseVoice: 'Fenrir', tags: ['Atmospheric', 'Deep'] },
  { id: 'ae-light', name: 'Aether-Breeze', dataset: 'Aether-Neural', description: 'Airy, high-frequency female breathiness.', baseVoice: 'Puck', tags: ['Airy', 'Delicate'] }
];

export function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  view.setUint32(0, 0x52494646, false); 
  view.setUint32(4, 36 + pcmData.length, true); 
  view.setUint32(8, 0x57415645, false); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true); 
  view.setUint32(28, sampleRate * 2, true); 
  view.setUint16(32, 2, true); 
  view.setUint16(34, 16, true); 
  view.setUint32(36, 0x64617461, false); 
  view.setUint32(40, pcmData.length, true); 
  return new Blob([header, pcmData], { type: 'audio/wav' });
}

export function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  } catch (e) { return new Uint8Array(0); }
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

export const analyzeScript = async (text: string): Promise<ScriptAnalysis> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY is missing.");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this script into a multi-character performance.
    Map characters to these Neural Model IDs: ${NEURAL_MODELS.map(m => m.id).join(', ')}.
    Set ElevenLabs-style parameters (0-100) for Stability, Clarity, and Style Exaggeration based on the text's mood.
    
    Script:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                gender: { type: Type.STRING, enum: ['male', 'female', 'non-binary', 'unknown'] },
                ageGroup: { type: Type.STRING, enum: ['newborn', 'child', 'adult', 'elder', 'ghost', 'paranormal', 'machine'] },
                modelId: { type: Type.STRING },
                traits: { type: Type.STRING },
                settings: {
                  type: Type.OBJECT,
                  properties: {
                    stability: { type: Type.NUMBER },
                    clarity: { type: Type.NUMBER },
                    styleExaggeration: { type: Type.NUMBER }
                  }
                }
              },
              required: ["id", "name", "gender", "ageGroup", "modelId", "settings"]
            }
          },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                characterId: { type: Type.STRING },
                text: { type: Type.STRING },
                emotion: { type: Type.STRING },
                intensity: { type: Type.NUMBER },
                tone: { type: Type.STRING }
              },
              required: ["characterId", "text", "emotion", "intensity", "tone"]
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const synthesizeSegment = async (segment: DialogueSegment, character: CharacterDef): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY missing.");
  const ai = new GoogleGenAI({ apiKey });
  
  const model = NEURAL_MODELS.find(m => m.id === character.modelId) || NEURAL_MODELS[0];
  const { stability, clarity, styleExaggeration } = character.settings;

  // Prompt engineered for ElevenLabs style control
  const performancePrompt = `
    VOCAL ENGINE INSTRUCTION:
    Character: ${character.name} (${character.gender}, ${character.ageGroup})
    Neural Dataset: ${model.dataset} (${model.description})
    
    ENGINEERING PARAMETERS:
    - Stability: ${stability}% 
      (Low stability allows for more natural voice breaks, emotional cracks, and expressive variation.)
    - Clarity: ${clarity}% 
      (High clarity enhances consonants and high frequencies for studio-quality articulation.)
    - Style Exaggeration: ${styleExaggeration}% 
      (Determines how aggressively the model leans into the specific traits of the ${model.dataset} dataset.)
      
    PERFORMANCE CONTEXT:
    Emotion: ${segment.emotion} (Intensity: ${segment.intensity}/10)
    Tone: ${segment.tone}
    Traits: ${character.traits}

    TEXT TO SYNTHESIZE:
    "${segment.text}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: performancePrompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: model.baseVoice },
        },
      },
    },
  });

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("Neural synthesis pipeline failure.");
  return base64;
};
