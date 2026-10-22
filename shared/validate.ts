import type { DebateRequest, ResearchRequest, SetupInput, TtsRequest } from './types.ts';
import { isKnownVoice } from './voices.ts';

export interface Validation {
  ok: boolean;
  error?: string;
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateSetup(input: Partial<SetupInput>): Validation {
  const language = input.language;
  if (language !== 'fa' && language !== 'en') {
    return { ok: false, error: 'زبان مناظره مشخص نیست.' };
  }

  const topic = clean(input.topic);
  if (topic.length < 8) return { ok: false, error: 'موضوع را حداقل در هشت حرف بنویس.' };
  if (topic.length > 600) return { ok: false, error: 'موضوع بیش از حد بلند است.' };

  const rounds = input.rounds;
  if (!Number.isInteger(rounds) || rounds! < 1 || rounds! > 4) {
    return { ok: false, error: 'تعداد راند باید بین ۱ و ۴ باشد.' };
  }

  const engine = input.engine === 'fish-free' ? 'fish-free' : 'kokoro';
  for (const [label, side] of [
    ['طرف اول', input.a],
    ['طرف دوم', input.b],
  ] as const) {
    const name = clean(side?.name);
    if (name.length < 2) return { ok: false, error: `نام ${label} را بنویس.` };
    if (name.length > 80) return { ok: false, error: `نام ${label} بیش از حد بلند است.` };
    if (clean(side?.note).length > 800) return { ok: false, error: `یادداشت ${label} بیش از حد بلند است.` };
    if (!isKnownVoice(language, engine, clean(side?.voiceId))) {
      return { ok: false, error: `صدای ${label} برای این زبان معتبر نیست.` };
    }
  }

  if (clean(input.a?.name).toLowerCase() === clean(input.b?.name).toLowerCase()) {
    return { ok: false, error: 'دو طرف نمی‌توانند یک نام داشته باشند.' };
  }

  return { ok: true };
}

export function validateResearchRequest(input: Partial<ResearchRequest>): Validation {
  if (input.language !== 'fa' && input.language !== 'en') {
    return { ok: false, error: 'زبان تحقیق مشخص نیست.' };
  }
  if (clean(input.name).length < 2) return { ok: false, error: 'نام برای تحقیق لازم است.' };
  if (clean(input.topic).length < 8) return { ok: false, error: 'موضوع برای تحقیق لازم است.' };
  if (clean(input.opponentName).length < 2) return { ok: false, error: 'نام حریف برای تحقیق لازم است.' };
  if (clean(input.note).length > 800) return { ok: false, error: 'یادداشت بیش از حد بلند است.' };
  return { ok: true };
}

export function validateDebateRequest(input: Partial<DebateRequest>): Validation {
  if (input.language !== 'fa' && input.language !== 'en') {
    return { ok: false, error: 'زبان مناظره مشخص نیست.' };
  }
  if (clean(input.topic).length < 8) return { ok: false, error: 'موضوع مناظره لازم است.' };
  if (!Number.isInteger(input.rounds) || input.rounds! < 1 || input.rounds! > 4) {
    return { ok: false, error: 'تعداد راند معتبر نیست.' };
  }
  if (clean(input.speakerA?.name).length < 2 || clean(input.speakerB?.name).length < 2) {
    return { ok: false, error: 'نام هر دو طرف لازم است.' };
  }
  if (!input.researchA || !input.researchB) {
    return { ok: false, error: 'هر دو پرونده تحقیق لازم است.' };
  }
  return { ok: true };
}

export function validateTtsRequest(input: Partial<TtsRequest>): Validation {
  const text = clean(input.text);
  if (text.length < 2) return { ok: false, error: 'متنی برای صدا نیست.' };
  if (text.length > 2500) return { ok: false, error: 'این نوبت برای یک قطعه صدا بیش از حد بلند است.' };
  if (input.language !== 'fa' && input.language !== 'en') {
    return { ok: false, error: 'زبان صدا مشخص نیست.' };
  }
  const engine = input.language === 'en' && input.engine === 'fish-free' ? 'fish-free' : 'kokoro';
  if (!input.voiceSample && !isKnownVoice(input.language, engine, clean(input.voiceId))) {
    return { ok: false, error: 'صدای انتخاب‌شده معتبر نیست.' };
  }
  return { ok: true };
}
