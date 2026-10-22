/**
 * Utility to concatenate multiple WAV base64 clips into a single master WAV audio track.
 * Supports adding natural pause silence between turns.
 */

export function base64ToUint8Array(base64: string): Uint8Array {
  // Handle optional data URI prefix
  const clean = base64.replace(/^data:audio\/\w+;base64,/, '').trim();
  const binaryString = atob(clean);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createWavHeader(
  dataLength: number,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Uint8Array {
  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);

  // "RIFF" chunk descriptor
  header.set([0x52, 0x49, 0x46, 0x46], 0);
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  header.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

  // "fmt " sub-chunk
  header.set([0x66, 0x6d, 0x74, 0x20], 12);
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (24000Hz)
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  view.setUint32(28, byteRate, true); // ByteRate
  const blockAlign = numChannels * (bitsPerSample / 8);
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample (16)

  // "data" sub-chunk
  header.set([0x64, 0x61, 0x74, 0x61], 36);
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return header;
}

export function concatenateWavBase64Clips(
  clipsBase64: string[],
  pauseDurationSeconds = 0.6,
  sampleRate = 24000
): Blob {
  const pcmChunks: Uint8Array[] = [];
  let totalDataLength = 0;

  // Silence pause between speeches: 16-bit mono = 2 bytes per sample
  const pauseSampleCount = Math.floor(sampleRate * pauseDurationSeconds);
  const pauseBuffer = new Uint8Array(pauseSampleCount * 2); // all 0s is digital silence

  for (let i = 0; i < clipsBase64.length; i++) {
    const rawWavBytes = base64ToUint8Array(clipsBase64[i]);

    // Standard WAV header is 44 bytes; find PCM data
    let pcmStart = 44;
    // Inspect for 'data' marker if possible
    for (let b = 12; b < Math.min(100, rawWavBytes.length - 8); b++) {
      if (
        rawWavBytes[b] === 0x64 && // 'd'
        rawWavBytes[b + 1] === 0x61 && // 'a'
        rawWavBytes[b + 2] === 0x74 && // 't'
        rawWavBytes[b + 3] === 0x61 // 'a'
      ) {
        pcmStart = b + 8;
        break;
      }
    }

    if (rawWavBytes.length > pcmStart) {
      const pcmData = rawWavBytes.subarray(pcmStart);
      pcmChunks.push(pcmData);
      totalDataLength += pcmData.length;

      // Add silence between clips (except after the very last clip)
      if (i < clipsBase64.length - 1 && pauseDurationSeconds > 0) {
        pcmChunks.push(pauseBuffer);
        totalDataLength += pauseBuffer.length;
      }
    }
  }

  // Create standard header for the combined audio
  const masterHeader = createWavHeader(totalDataLength, sampleRate, 1, 16);

  // Return a single combined Blob
  return new Blob([masterHeader, ...pcmChunks], { type: 'audio/wav' });
}
