
export interface VocalDirection {
  pitch: number;    // 0.5 to 2.0
  rate: number;     // 0.5 to 2.0
  volume: number;   // 0.0 to 1.0
  emotion: string;  
  subtext: string;  // The hidden meaning Gemini found
  emphasis: string[]; // Words to stress
}

export interface PerformanceSegment {
  id: string;
  text: string;
  direction: VocalDirection;
}

export interface DirectorialResponse {
  thinkingProcess: string; // Summary of the "Thinking" phase
  overallMood: string;
  segments: PerformanceSegment[];
}

export interface VoiceProfile {
  name: string;
  lang: string;
  isLocal: boolean;
  voiceURI: string;
}

/**
 * Character categories for script analysis
 */
export type CharacterType = 'ghost' | 'paranormal' | 'newborn' | 'child' | 'elder' | 'adult';

/**
 * Character definition within a script
 */
export interface ScriptCharacter {
  id: string;
  name: string;
  ageGroup: CharacterType;
}

/**
 * A dialogue segment for script analysis
 */
export interface ScriptSegment {
  characterId: string;
  text: string;
  emotion: string;
}

/**
 * Result of the neural script analysis phase
 */
export interface ScriptAnalysis {
  summary: string;
  characters: ScriptCharacter[];
  segments: ScriptSegment[];
}
