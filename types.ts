export type CharacterDemographic = 
  | 'Man' 
  | 'Old Man' 
  | 'Woman' 
  | 'Boy Kid' 
  | 'Girl Kid' 
  | 'Newborn Baby' 
  | 'Paranormal Ghost';

export type EmotionType = 
  | 'Fear' 
  | 'Happy' 
  | 'Excited' 
  | 'Love' 
  | 'Emotional' 
  | 'Despair' 
  | 'Authoritative' 
  | 'Neutral';

export interface VocalDirection {
  pitch: number;    // 0.5 to 2.0
  rate: number;     // 0.5 to 2.0
  volume: number;   // 0.0 to 1.0
  emotion: EmotionType;
  subtext: string;
  emphasis: string[];
}

export interface CharacterProfile {
  id: string;
  name: string;
  demographic: CharacterDemographic;
  assignedVoiceURI?: string;
}

export interface PerformanceSegment {
  id: string;
  characterId: string;
  text: string;
  direction: VocalDirection;
}

export interface DirectorialResponse {
  thinkingProcess: string;
  overallMood: string;
  characters: CharacterProfile[];
  segments: PerformanceSegment[];
}

export interface VoiceProfile {
  name: string;
  lang: string;
  isLocal: boolean;
  voiceURI: string;
}