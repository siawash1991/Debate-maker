import type { ResearchDossier, ResearchRequest } from '../../../shared/types.ts';
import { chatJson } from '../openrouter.ts';
import { normalizeResearch } from './normalize.ts';
import { researchSystemPrompt, researchUserPrompt } from './prompts.ts';

/** One isolated research agent. Call it twice, once per debater, so neither sees the other's dossier. */
export async function runResearchAgent(input: ResearchRequest): Promise<ResearchDossier> {
  const raw = await chatJson({
    system: researchSystemPrompt(),
    user: researchUserPrompt(input),
    temperature: 0.4,
    maxTokens: 1800,
  });
  return normalizeResearch(raw, input.name.trim());
}
