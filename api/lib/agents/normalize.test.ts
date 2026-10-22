import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDebate, normalizeResearch } from './normalize';

const dossier = {
  name: 'Socrates',
  stance: 'He treats the topic as a failed definition that has not yet been examined.',
  coreClaims: ['You are using the word as if it already had a limit.', 'An unexamined claim is only a habit.'],
  evidence: ['The early dialogues stop when the definition collapses.'],
  quotes: [],
  method: 'Chained questions.',
  blindSpots: ['He can leave the room without a positive account.'],
  wouldNeverSay: ['I have settled this with a system.'],
  vocabulary: ['definition'],
  pressurePoints: ['Ask him what he offers once the definition is gone.'],
};

test('normalizeResearch keeps a complete dossier and drops empty quotes', () => {
  const result = normalizeResearch(dossier, 'Socrates');
  assert.equal(result.coreClaims.length, 2);
  assert.deepEqual(result.quotes, []);
});

test('normalizeResearch rejects a thin dossier', () => {
  assert.throws(() => normalizeResearch({ stance: 'short' }, 'X'), /ناقص/);
});

test('normalizeDebate keeps alternating turns and names the speakers', () => {
  const script = normalizeDebate(
    {
      premise: 'They disagree about whether a definition must come first.',
      turns: [
        { speaker: 'Socrates', text: 'You keep using the word as though we had already agreed what it refuses to include, and that is the whole trick.', move: 'opens', delivery: 'dry, slow' },
        { speaker: 'b', text: 'Your question is a way of never having to stand anywhere, and the topic will not wait for that performance.', move: 'rejects the opening', delivery: 'sharp, fast' },
      ],
    },
    1,
    'Socrates',
    'Nietzsche',
  );
  assert.equal(script.turns[0].speaker, 'a');
  assert.equal(script.turns[1].speakerName, 'Nietzsche');
});

test('normalizeDebate rejects a script that does not alternate', () => {
  assert.throws(
    () =>
      normalizeDebate(
        {
          turns: [
            { speaker: 'a', text: 'This opening is long enough to count as a real spoken turn in the debate.', move: 'opens', delivery: 'calm' },
            { speaker: 'a', text: 'This second turn is also long enough, but it comes from the same speaker again.', move: 'repeats', delivery: 'calm' },
          ],
        },
        1,
        'A',
        'B',
      ),
    /عوض نشدند/,
  );
});
