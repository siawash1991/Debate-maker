import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSpeechRequest } from './tts';

test('Persian speech uses Gemini TTS, a named voice, and mp3', () => {
  const body = buildSpeechRequest({
    text: 'این یک جمله برای آزمون صدا است.',
    language: 'fa',
    voiceId: 'Kore',
    delivery: 'calm, firm',
  });
  assert.equal(body.model, 'google/gemini-3.8-flash-tts');
  assert.equal(body.voice, 'Kore');
  assert.equal(body.response_format, 'mp3');
  assert.equal(body.instructions, 'calm, firm');
});

test('English Kokoro speech sends a real voice id and no instructions', () => {
  const body = buildSpeechRequest({
    text: 'This is a spoken English sentence for the test.',
    language: 'en',
    voiceId: 'af_heart',
    engine: 'kokoro',
    delivery: 'bright',
  });
  assert.equal(body.model, 'hexgrad/kokoro-82m');
  assert.equal(body.voice, 'af_heart');
  assert.equal(body.instructions, undefined);
});

test('English free speech omits voice and describes delivery instead', () => {
  const body = buildSpeechRequest({
    text: 'This is a spoken English sentence for the test.',
    language: 'en',
    voiceId: 'female-clear',
    engine: 'fish-free',
    delivery: 'pressing',
  });
  assert.equal(body.model, 'fish-audio/s2.1-pro-free:free');
  assert.equal(body.voice, undefined);
  assert.match(String(body.instructions), /Adult female/);
  assert.match(String(body.instructions), /pressing/);
});

test('a voice sample is attached as a reference and replaces the preset voice', () => {
  const body = buildSpeechRequest({
    text: 'Hello from the cloned voice sample in this test.',
    language: 'en',
    voiceId: 'af_heart',
    engine: 'kokoro',
    voiceSample: { audioBase64: 'AAAA', mimeType: 'audio/mpeg', transcript: 'hello there' },
  });
  assert.equal(body.voice, undefined);
  const references = body.input_references as { type: string; text?: string; input_audio?: { data: string } }[];
  assert.equal(references[0].type, 'input_audio');
  assert.match(references[0].input_audio?.data || '', /^data:audio\/mpeg;base64,/);
  assert.equal(references[1].text, 'hello there');
});
