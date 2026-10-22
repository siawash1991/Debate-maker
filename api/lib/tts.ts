import type { TtsRequest } from '../../shared/types.ts';
import { fishStyleInstructions } from '../../shared/voices.ts';
import { speech } from './openrouter.ts';

const PERSIAN_MODEL = 'google/gemini-3.8-flash-tts';
const ENGLISH_MODEL = 'hexgrad/kokoro-82m';
const ENGLISH_FREE_MODEL = 'fish-audio/s2.1-pro-free:free';

export function buildSpeechRequest(input: TtsRequest): Record<string, unknown> {
  const delivery = input.delivery?.trim() || '';
  const body: Record<string, unknown> = {
    input: input.text.trim(),
    response_format: 'mp3',
  };

  if (input.voiceSample?.audioBase64) {
    const mime = input.voiceSample.mimeType === 'audio/wav' ? 'audio/wav' : 'audio/mpeg';
    const data = input.voiceSample.audioBase64.startsWith('data:')
      ? input.voiceSample.audioBase64
      : `data:${mime};base64,${input.voiceSample.audioBase64}`;
    body.model = input.language === 'fa' ? persianModel() : englishModel(input.engine);
    body.input_references = [{ type: 'input_audio', input_audio: { data } }];
    if (input.voiceSample.transcript?.trim()) {
      (body.input_references as unknown[]).push({ type: 'text', text: input.voiceSample.transcript.trim() });
    }
    if (delivery) body.instructions = delivery;
    return body;
  }

  if (input.language === 'fa') {
    body.model = persianModel();
    body.voice = input.voiceId;
    if (delivery) body.instructions = delivery;
    return body;
  }

  if (input.engine === 'fish-free') {
    body.model = englishFreeModel();
    body.instructions = [fishStyleInstructions(input.voiceId), delivery].filter(Boolean).join(' ');
    return body;
  }

  body.model = englishModel(input.engine);
  body.voice = input.voiceId;
  return body;
}

export async function synthesize(input: TtsRequest): Promise<{ audioBase64: string; model: string }> {
  return speech(buildSpeechRequest(input));
}

function persianModel(): string {
  return process.env.OPENROUTER_TTS_MODEL_FA?.trim() || PERSIAN_MODEL;
}

function englishModel(engine: TtsRequest['engine']): string {
  if (engine === 'fish-free') return englishFreeModel();
  return process.env.OPENROUTER_TTS_MODEL_EN?.trim() || ENGLISH_MODEL;
}

function englishFreeModel(): string {
  return process.env.OPENROUTER_TTS_MODEL_EN_FREE?.trim() || ENGLISH_FREE_MODEL;
}
