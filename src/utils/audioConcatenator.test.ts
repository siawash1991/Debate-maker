import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWavHeader,
  base64ToUint8Array,
  concatenateWavBase64Clips,
} from './audioConcatenator';

test('createWavHeader creates valid 44-byte RIFF WAVE header', () => {
  const dataSize = 48000; // 1 second of 24kHz 16-bit mono
  const header = createWavHeader(dataSize, 24000, 1, 16);

  assert.equal(header.length, 44);

  // Check 'RIFF' marker
  assert.equal(String.fromCharCode(header[0], header[1], header[2], header[3]), 'RIFF');

  // Check 'WAVE' marker
  assert.equal(String.fromCharCode(header[8], header[9], header[10], header[11]), 'WAVE');

  // Check 'fmt ' marker
  assert.equal(String.fromCharCode(header[12], header[13], header[14], header[15]), 'fmt ');

  // Check 'data' marker
  assert.equal(String.fromCharCode(header[36], header[37], header[38], header[39]), 'data');

  // Check data length in DataView
  const view = new DataView(header.buffer);
  assert.equal(view.getUint32(40, true), dataSize);
});

test('concatenateWavBase64Clips stitches multiple WAV clips', () => {
  // Generate two synthetic mini WAV files with 100 bytes of PCM each
  const pcm1 = new Uint8Array(100).fill(12);
  const pcm2 = new Uint8Array(100).fill(24);

  const header1 = createWavHeader(100, 24000, 1, 16);
  const header2 = createWavHeader(100, 24000, 1, 16);

  const fullClip1 = new Uint8Array(44 + 100);
  fullClip1.set(header1, 0);
  fullClip1.set(pcm1, 44);

  const fullClip2 = new Uint8Array(44 + 100);
  fullClip2.set(header2, 0);
  fullClip2.set(pcm2, 44);

  // Convert to base64
  const b64_1 = Buffer.from(fullClip1).toString('base64');
  const b64_2 = Buffer.from(fullClip2).toString('base64');

  const combinedBlob = concatenateWavBase64Clips([b64_1, b64_2], 0);

  // Should have header (44) + pcm1 (100) + pcm2 (100) = 244 bytes
  assert.equal(combinedBlob.size, 244);
  assert.equal(combinedBlob.type, 'audio/wav');
});
