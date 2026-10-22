import test from 'node:test';
import assert from 'node:assert/strict';
import { extractJson } from './json';

test('extractJson reads a raw object', () => {
  assert.deepEqual(extractJson('{"ok":true}'), { ok: true });
});

test('extractJson reads a fenced object with surrounding prose', () => {
  const parsed = extractJson('نتیجه:\n```json\n{"stance":"آزادی"}\n```');
  assert.deepEqual(parsed, { stance: 'آزادی' });
});

test('extractJson rejects text without an object', () => {
  assert.throws(() => extractJson('هیچ'), /JSON/);
});
