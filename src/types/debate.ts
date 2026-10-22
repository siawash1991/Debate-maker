export interface Character {
  id: string;
  name: string;
  persianName: string;
  title: string;
  era: string;
  avatar: string;
  gender: 'male' | 'female';
  voiceName: 'Puck' | 'Charon' | 'Fenrir' | 'Kore' | 'Zephyr';
  tone: string;
  bio: string;
  signatureQuote: string;
  isCustom?: boolean;
}

export interface VoiceOption {
  id: 'Puck' | 'Charon' | 'Fenrir' | 'Kore' | 'Zephyr';
  name: string;
  gender: 'male' | 'female';
  vocalStyle: string;
  description: string;
  sampleText: string;
}

export interface CharacterAnalysis {
  worldview: string;
  keyArguments: string[];
  vulnerabilities: string[];
  rhetoricalTactics: string[];
  historicalContext: string;
  signaturePhrases: string[];
}

export interface DebateResearch {
  char1Analysis: CharacterAnalysis;
  char2Analysis: CharacterAnalysis;
  clashPoints: string[];
  philosophicalDivergence: string;
}

export interface PersonaSystemPrompts {
  char1Prompt: string;
  char2Prompt: string;
  moderatorPrompt: string;
}

export interface DebateTurn {
  id: string;
  turnNumber: number;
  speaker: 'char1' | 'char2' | 'moderator';
  speakerName: string;
  text: string;
  tone: string;
  rhetoricalMove: string;
  audioBase64?: string;
  audioLoading?: boolean;
}

export interface DebateVerdict {
  winner: 'char1' | 'char2' | 'draw';
  winnerName: string;
  winnerReason: string;
  char1Score: {
    logic: number;
    eloquence: number;
    rebuttal: number;
    total: number;
  };
  char2Score: {
    logic: number;
    eloquence: number;
    rebuttal: number;
    total: number;
  };
  keyTakeaway: string;
  audienceSentiment: {
    char1Percentage: number;
    char2Percentage: number;
    swingFactor: string;
  };
}

export interface DebateResult {
  id: string;
  topic: string;
  roundsCount: number;
  character1: Character;
  character2: Character;
  moderatorEnabled: boolean;
  research: DebateResearch;
  personaPrompts: PersonaSystemPrompts;
  turns: DebateTurn[];
  verdict: DebateVerdict;
  createdAt: string;
}

export interface GenerateDebateRequest {
  character1: Character;
  character2: Character;
  topic: string;
  roundsCount: number;
  moderatorEnabled: boolean;
  debateTone: string;
}
