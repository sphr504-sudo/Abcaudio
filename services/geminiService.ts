
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CharacterDef, DialogueSegment, ScriptAnalysis, VoiceBase, VoiceModel } from "../types";

const getApiKey = () => process.env.API_KEY || "";

export const VOICE_MODELS: VoiceModel[] = [
  { id: 'ljs-01', name: 'LJSpeech-v1', dataset: 'LJSpeech', description: 'Clear narrative monologue voice.', baseVoice: 'Kore', tags: ['Narrative', 'Steady'] },
  { id: 'rms-male', name: 'Arctic-RMS', dataset: 'CMU Arctic', description: 'Deep, resonant male voice.', baseVoice: 'Fenrir', tags: ['Deep', 'Male'] },
  { id: 'slt-female', name: 'Arctic-SLT', dataset: 'CMU Arctic', description: 'Precise and soft female articulation.', baseVoice: 'Puck', tags: ['Gentle', 'Female'] },
  { id: 'uk-elder', name: 'Common-UK', dataset: 'Mozilla', description: 'Sophisticated elderly British tone.', baseVoice: 'Charon', tags: ['Elderly', 'British'] },
  { id: 'vctk-youth', name: 'VCTK-Youth', dataset: 'Mozilla', description: 'Fast, modern, energetic young adult.', baseVoice: 'Zephyr', tags: ['Energetic', 'Youth'] },
  { id: 'ghost-ethereal', name: 'Aether-Ghost', dataset: 'Custom', description: 'Whispering, hollow supernatural tone.', baseVoice: 'Charon', tags: ['Ghostly', 'Paranormal'] },
  { id: 'infant-01', name: 'Aether-Infant', dataset: 'Custom', description: 'High-pitched, babbling newborn sounds.', baseVoice: 'Puck', tags: ['Newborn', 'Soft'] },
  { id: 'deep-bass', name: 'Mozilla-Deep', dataset: 'Mozilla', description: 'Ultra-low frequency authoritative voice.', baseVoice: 'Fenrir', tags: ['Bass', 'Power'] },
  { id: 'fest-bot', name: 'Festvox-Robot', dataset: 'Festvox', description: 'Flat, analytical machine intelligence.', baseVoice: 'Zephyr', tags: ['Machine', 'Flat'] },
  { id: 'synth-real', name: 'Synth-01', dataset: 'Custom', description: 'Hyper-realistic balanced studio voice.', baseVoice: 'Kore', tags: ['Premium', 'Pro'] }
];

export function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.length, true); 
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); 
  view.setUint32(16, 16, true); 
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
  } catch (e) {
    return new Uint8Array(0);
  }
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
    contents: `Analyze this script. Map characters to these IDs: ${VOICE_MODELS.map(m => m.id).join(', ')}.
    Assign settings for stability, clarity, and style (0-100).
    
    Text: ${text}`,
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
  
  const model = VOICE_MODELS.find(m => m.id === character.modelId) || VOICE_MODELS[0];
  const { stability, clarity, styleExaggeration } = character.settings;

  const personaPrompt = `
    Vocal Performance for "${character.name}" (Model: ${model.name}).
    Dataset Influence: ${model.dataset}.
    
    Performance Parameters:
    - Stability: ${stability}% (Higher = more robotic/steady, Lower = more emotional/varied).
    - Clarity: ${clarity}% (Higher = precise articulation, Lower = natural mumbling/breaths).
    - Emotion: ${segment.emotion} at Intensity ${segment.intensity}/10.
    - Style Exaggeration: ${styleExaggeration}% (Higher = more dramatic performance).
    
    Text to speak: "${segment.text}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: personaPrompt }] }],
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
  if (!base64) throw new Error("Synthesis failed.");
  return base64;
};
