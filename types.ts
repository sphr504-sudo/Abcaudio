
export type VoiceBase = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export type CharacterType = 'newborn' | 'child' | 'adult' | 'elder' | 'ghost' | 'paranormal' | 'machine';

export interface VoiceModel {
  id: string;
  name: string;
  description: string;
  dataset: 'LJSpeech' | 'CMU Arctic' | 'Mozilla' | 'Festvox' | 'Custom';
  baseVoice: VoiceBase;
  tags: string[];
}

export interface VoiceSettings {
  stability: number; // 0-100
  clarity: number;   // 0-100
  styleExaggeration: number; // 0-100
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
