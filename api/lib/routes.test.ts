import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { handleHealth, handleResearch } from './routes';

describe('route guards', { concurrency: false }, () => {

test('health stays open when no access key is configured', async () => {
  const previous = process.env.APP_ACCESS_KEY;
  delete process.env.APP_ACCESS_KEY;
  const result = await handleHealth({ method: 'GET' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, needsAccessKey: false });
  restore('APP_ACCESS_KEY', previous);
});

test('health rejects a missing access key when one is configured', async () => {
  const previous = process.env.APP_ACCESS_KEY;
  process.env.APP_ACCESS_KEY = 'secret-key';
  const denied = await handleHealth({ method: 'GET' });
  assert.equal(denied.status, 401);
  const allowed = await handleHealth({ method: 'GET', accessKey: 'secret-key' });
  assert.equal(allowed.status, 200);
  restore('APP_ACCESS_KEY', previous);
});

test('research without an OpenRouter key does not pretend to succeed', async () => {
  const previous = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  const result = await handleResearch({
    method: 'POST',
    body: {
      name: 'سقراط',
      note: '',
      topic: 'آیا انسان در عمل مختار است؟',
      opponentName: 'نیچه',
      language: 'fa',
    },
  });
  assert.equal(result.status, 500);
  assert.match((result.body as { error: string }).error, /OPENROUTER_API_KEY/);
  restore('OPENROUTER_API_KEY', previous);
});

});

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
