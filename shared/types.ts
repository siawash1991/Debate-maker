export type Language = 'fa' | 'en';

export type EnglishEngine = 'kokoro' | 'fish-free';

export interface DebaterInput {
  name: string;
  note: string;
  voiceId: string;
}

/** Later version: a short clean clip of the speaker. The server can already attach it; the page does not ask for it yet. */
export interface VoiceSample {
  audioBase64: string;
  mimeType: 'audio/mpeg' | 'audio/wav';
  transcript?: string;
}

export interface ResearchDossier {
  name: string;
  stance: string;
  coreClaims: string[];
  evidence: string[];
  quotes: string[];
  method: string;
  blindSpots: string[];
  wouldNeverSay: string[];
  vocabulary: string[];
  pressurePoints: string[];
}

export interface DebateTurn {
  id: string;
  speaker: 'a' | 'b';
  speakerName: string;
  text: string;
  move: string;
  delivery: string;
}

export interface DebateScript {
  premise: string;
  turns: DebateTurn[];
}

export interface ResearchRequest {
  name: string;
  note: string;
  topic: string;
  opponentName: string;
  language: Language;
}

export interface DebateRequest {
  language: Language;
  topic: string;
  rounds: number;
  speakerA: { name: string; note: string };
  speakerB: { name: string; note: string };
  researchA: ResearchDossier;
  researchB: ResearchDossier;
}

export interface TtsRequest {
  text: string;
  language: Language;
  voiceId: string;
  delivery?: string;
  engine?: EnglishEngine;
  voiceSample?: VoiceSample;
}

export interface SetupInput {
  language: Language;
  topic: string;
  rounds: number;
  engine: EnglishEngine;
  a: DebaterInput;
  b: DebaterInput;
}
