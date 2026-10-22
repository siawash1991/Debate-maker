import type { DebateRequest, DebateScript } from '../../../shared/types.ts';
import { chatJson } from '../openrouter.ts';
import { normalizeDebate } from './normalize.ts';
import { debateSystemPrompt, debateUserPrompt } from './prompts.ts';

/** Reads both finished dossiers and writes a debate in which every turn answers the one before it. */
export async function runDebateAgent(input: DebateRequest): Promise<DebateScript> {
  const raw = await chatJson({
    system: debateSystemPrompt(input.rounds),
    user: debateUserPrompt(input),
    temperature: 0.7,
    maxTokens: 4500,
  });
  return normalizeDebate(raw, input.rounds, input.speakerA.name.trim(), input.speakerB.name.trim());
}
