import test from 'node:test';
import assert from 'node:assert/strict';
import { debateSystemPrompt, debateUserPrompt, researchSystemPrompt, researchUserPrompt } from './prompts';
import type { DebateRequest } from '../../../shared/types';

test('research prompt is one person only and forbids invented quotes', () => {
  const system = researchSystemPrompt();
  assert.match(system, /single debater/);
  assert.match(system, /Do not invent a quotation/);
  const user = researchUserPrompt({
    name: 'سقراط',
    note: '',
    topic: 'آیا انسان مختار است؟',
    opponentName: 'نیچه',
    language: 'fa',
  });
  assert.match(user, /سقراط/);
  assert.match(user, /نیچه/);
  assert.doesNotMatch(user, /Write the/);
});

test('debate prompt demands an answer to the previous turn and an exact count', () => {
  const system = debateSystemPrompt(3);
  assert.match(system, /Exactly 6 turns/);
  assert.match(system, /wouldNeverSay/);
  assert.match(system, /No host/);
  assert.match(system, /ignores the previous turn is a failure/);

  const request: DebateRequest = {
    language: 'en',
    topic: 'Is a person free in practice?',
    rounds: 3,
    speakerA: { name: 'Socrates', note: 'questions' },
    speakerB: { name: 'Nietzsche', note: 'aphorism' },
    researchA: {
      name: 'Socrates',
      stance: 'Definition first.',
      coreClaims: ['The word has no limit yet.'],
      evidence: [],
      quotes: [],
      method: 'questions',
      blindSpots: [],
      wouldNeverSay: [],
      vocabulary: [],
      pressurePoints: ['He offers no replacement.'],
    },
    researchB: {
      name: 'Nietzsche',
      stance: 'Values are made.',
      coreClaims: ['Comfort is not an argument.'],
      evidence: [],
      quotes: [],
      method: 'aphorism',
      blindSpots: [],
      wouldNeverSay: [],
      vocabulary: [],
      pressurePoints: ['He sneers past the distinction.'],
    },
  };
  const user = debateUserPrompt(request);
  assert.match(user, /The word has no limit yet/);
  assert.match(user, /Comfort is not an argument/);
  assert.match(user, /6 spoken turns/);
});
