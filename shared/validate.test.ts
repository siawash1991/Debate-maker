import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSetup } from './validate';
import { defaultVoice } from './voices';

const base = {
  language: 'fa' as const,
  topic: 'آیا انسان در عمل مختار است؟',
  rounds: 3,
  engine: 'kokoro' as const,
  a: { name: 'سقراط', note: '', voiceId: defaultVoice('fa', 'a', 'kokoro') },
  b: { name: 'نیچه', note: '', voiceId: defaultVoice('fa', 'b', 'kokoro') },
};

test('validateSetup accepts a complete Persian setup', () => {
  assert.equal(validateSetup(base).ok, true);
});

test('validateSetup rejects a short topic and identical names', () => {
  assert.equal(validateSetup({ ...base, topic: 'کوتاه' }).ok, false);
  assert.equal(validateSetup({ ...base, b: { ...base.b, name: 'سقراط' } }).ok, false);
});

test('validateSetup rejects a voice from the other language', () => {
  const result = validateSetup({ ...base, a: { ...base.a, voiceId: 'am_michael' } });
  assert.equal(result.ok, false);
});
