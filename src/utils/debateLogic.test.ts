import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDebateRequest,
  estimateSpeechDurationMs,
  formatTime,
  generateDeterministicDebate,
  PRESET_CHARACTERS,
  PRESET_VOICES,
} from './debateLogic';

test('validateDebateRequest rejects empty topic', () => {
  const result = validateDebateRequest({
    topic: '',
    character1: PRESET_CHARACTERS[0],
    character2: PRESET_CHARACTERS[1],
  });
  assert.equal(result.valid, false);
  assert.match(result.error || '', /موضوع/);
});

test('validateDebateRequest rejects short topic', () => {
  const result = validateDebateRequest({
    topic: 'سلام',
    character1: PRESET_CHARACTERS[0],
    character2: PRESET_CHARACTERS[1],
  });
  assert.equal(result.valid, false);
});

test('validateDebateRequest rejects identical characters', () => {
  const result = validateDebateRequest({
    topic: 'آیا هوش مصنوعی آگاهی دارد؟',
    character1: PRESET_CHARACTERS[0],
    character2: PRESET_CHARACTERS[0],
  });
  assert.equal(result.valid, false);
  assert.match(result.error || '', /یکسان/);
});

test('validateDebateRequest approves valid configuration', () => {
  const result = validateDebateRequest({
    topic: 'آیا هوش مصنوعی آگاهی دارد یا خیر؟',
    character1: PRESET_CHARACTERS[0],
    character2: PRESET_CHARACTERS[1],
  });
  assert.equal(result.valid, true);
});

test('estimateSpeechDurationMs calculates realistic audio timing', () => {
  const shortText = 'سلام و درود به همه حاضرین استودیو';
  const duration = estimateSpeechDurationMs(shortText);
  assert.ok(duration >= 3000, 'Min duration is 3000ms');

  const longText = Array(130).fill('کلمه').join(' ');
  const longDuration = estimateSpeechDurationMs(longText, 130);
  assert.ok(longDuration >= 58000 && longDuration <= 62000);
});

test('formatTime formats minutes and seconds correctly', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(125), '2:05');
});

test('generateDeterministicDebate creates complete research and multi-round turns', () => {
  const debate = generateDeterministicDebate({
    topic: 'جبر یا اختیار در سرنوشت انسان',
    character1: PRESET_CHARACTERS[0],
    character2: PRESET_CHARACTERS[1],
    roundsCount: 3,
    moderatorEnabled: true,
    debateTone: 'فلسفی و عمیق',
  });

  assert.ok(debate.id.startsWith('debate-'));
  assert.equal(debate.character1.persianName, 'سقراط');
  assert.equal(debate.character2.persianName, 'فردریش نیچه');
  assert.ok(debate.turns.length >= 6, 'Should have multiple debate turns');
  assert.ok(debate.research.clashPoints.length >= 2, 'Should have clash points');
  assert.ok(debate.personaPrompts.char1Prompt.length > 20, 'Should have persona prompt 1');
  assert.ok(debate.personaPrompts.char2Prompt.length > 20, 'Should have persona prompt 2');
  assert.ok(debate.verdict.winnerScore || debate.verdict.char1Score.total > 0);
});

test('preset voices and characters are well-formed', () => {
  assert.ok(PRESET_VOICES.length >= 5);
  const maleVoices = PRESET_VOICES.filter((v) => v.gender === 'male');
  const femaleVoices = PRESET_VOICES.filter((v) => v.gender === 'female');
  assert.ok(maleVoices.length > 0, 'Must have male voices');
  assert.ok(femaleVoices.length > 0, 'Must have female voices');
  assert.ok(PRESET_CHARACTERS.length >= 6, 'Must have diverse characters');
});
