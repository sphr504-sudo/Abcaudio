
export type VoiceBase = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export type CharacterType = 'newborn' | 'child' | 'adult' | 'elder' | 'ghost' | 'paranormal' | 'machine';

export interface VoiceModel {
  id: string;
  name: string;
  description: string;
  dataset: 'LJSpeech' | 'CMU Arctic' | 'Mozilla' | 'Festvox' | 'Aether-Neural';
  baseVoice: VoiceBase;
  tags: string[];
}

export interface VoiceSettings {
  stability: number; // 0-100 (Consistency vs Emotion)
  clarity: number;   // 0-100 (High-freq detail)
  styleExaggeration: number; // 0-100 (Dramatic weight)
}

export interface VoicePreset {
  id: string;
  name: string;
  modelId: string;
  settings: VoiceSettings;
}

export interface CharacterDef {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  ageGroup: CharacterType;
  modelId: string;
  traits: string;
  settings: VoiceSettings;
}

export interface DialogueSegment {
  characterId: string;
  text: string;
  emotion: string;
  intensity: number;
  tone: string;
}

export interface ScriptAnalysis {
  summary: string;
  characters: CharacterDef[];
  segments: DialogueSegment[];
}
