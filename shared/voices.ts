import type { EnglishEngine, Language } from './types.ts';

export interface VoiceChoice {
  id: string;
  label: string;
}

export interface FishStyle {
  id: string;
  label: string;
  instructions: string;
}

export interface Preset {
  id: string;
  nameFa: string;
  nameEn: string;
  noteFa: string;
  noteEn: string;
  voiceFa: string;
  voiceEn: string;
  voiceFree: string;
}

export const FA_VOICES: VoiceChoice[] = [
  { id: 'Charon', label: 'مرد · Charon · بم و شمرده' },
  { id: 'Fenrir', label: 'مرد · Fenrir · محکم' },
  { id: 'Puck', label: 'مرد · Puck · چالاک' },
  { id: 'Orus', label: 'مرد · Orus · جدی' },
  { id: 'Algieba', label: 'مرد · Algieba · نرم' },
  { id: 'Schedar', label: 'مرد · Schedar · یکنواخت' },
  { id: 'Kore', label: 'زن · Kore · استوار' },
  { id: 'Zephyr', label: 'زن · Zephyr · روشن' },
  { id: 'Aoede', label: 'زن · Aoede · روان' },
  { id: 'Leda', label: 'زن · Leda · جوان' },
  { id: 'Callirrhoe', label: 'زن · Callirrhoe · آرام' },
  { id: 'Achernar', label: 'زن · Achernar · ملایم' },
];

export const EN_VOICES: VoiceChoice[] = [
  { id: 'am_michael', label: 'Male · Michael · American' },
  { id: 'am_onyx', label: 'Male · Onyx · American, lower' },
  { id: 'am_fenrir', label: 'Male · Fenrir · American' },
  { id: 'bm_george', label: 'Male · George · British' },
  { id: 'bm_fable', label: 'Male · Fable · British' },
  { id: 'af_heart', label: 'Female · Heart · American' },
  { id: 'af_bella', label: 'Female · Bella · American' },
  { id: 'af_sarah', label: 'Female · Sarah · American' },
  { id: 'bf_emma', label: 'Female · Emma · British' },
  { id: 'bf_isabella', label: 'Female · Isabella · British' },
];

/** Fish S2.1 Pro Free has one default timbre. These only change delivery, not the speaker. */
export const EN_FREE_STYLES: FishStyle[] = [
  { id: 'male-low', label: 'مرد · بم و آرام', instructions: 'Adult male, low, steady, clear.' },
  { id: 'male-sharp', label: 'مرد · تند و قاطع', instructions: 'Adult male, assertive, quicker, clear.' },
  { id: 'female-clear', label: 'زن · روشن و شمرده', instructions: 'Adult female, clear, measured, calm.' },
  { id: 'female-firm', label: 'زن · محکم', instructions: 'Adult female, firm, direct, slightly fast.' },
];

export const PRESETS: Preset[] = [
  {
    id: 'socrates',
    nameFa: 'سقراط',
    nameEn: 'Socrates',
    noteFa: 'فیلسوف آتنی. با پرسش زنجیره‌ای تعریف حریف را خالی می‌کند و وانمود نمی‌کند پاسخ آماده دارد.',
    noteEn: 'Athenian philosopher. Empties a definition with chained questions and does not pretend to hold a finished answer.',
    voiceFa: 'Charon',
    voiceEn: 'bm_george',
    voiceFree: 'male-low',
  },
  {
    id: 'nietzsche',
    nameFa: 'فردریش نیچه',
    nameEn: 'Friedrich Nietzsche',
    noteFa: 'با ضرب‌المثل و تحقیرِ اخلاقِ آسوده حرف می‌زند. از فضیلتِ گله بیزار است و به قدرتِ آفرینشِ ارزش برمی‌گردد.',
    noteEn: 'Speaks in aphorism and contempt for comfortable morality. Distrusts herd virtue and returns to the creation of values.',
    voiceFa: 'Fenrir',
    voiceEn: 'am_fenrir',
    voiceFree: 'male-sharp',
  },
  {
    id: 'avicenna',
    nameFa: 'ابن سینا',
    nameEn: 'Avicenna',
    noteFa: 'فیلسوف مشائی. اول حد تعریف را می‌بندد، بعد برهان می‌چیند و مثال طبیعی را به کار می‌گیرد.',
    noteEn: 'Peripatetic philosopher. Fixes the definition first, then stacks demonstrations and uses a natural example.',
    voiceFa: 'Orus',
    voiceEn: 'am_michael',
    voiceFree: 'male-low',
  },
  {
    id: 'beauvoir',
    nameFa: 'سیمون دوبوار',
    nameEn: 'Simone de Beauvoir',
    noteFa: 'آزادی را وضعیتِ ساخته‌شده می‌داند، نه ذات. موقعیت، بدن و رابطه با دیگری را به استدلال برمی‌گرداند.',
    noteEn: 'Treats freedom as a made situation, not an essence. Brings the argument back to situation, body, and the other.',
    voiceFa: 'Zephyr',
    voiceEn: 'bf_emma',
    voiceFree: 'female-firm',
  },
  {
    id: 'einstein',
    nameFa: 'آلبرت اینشتین',
    nameEn: 'Albert Einstein',
    noteFa: 'با آزمایش فکری و ساده‌سازی حرف می‌زند. علم را از مسئولیتِ نتیجه‌اش جدا نمی‌کند.',
    noteEn: 'Argues by thought experiment and simplification. Does not separate science from the responsibility for its results.',
    voiceFa: 'Puck',
    voiceEn: 'am_michael',
    voiceFree: 'male-low',
  },
  {
    id: 'curie',
    nameFa: 'ماری کوری',
    nameEn: 'Marie Curie',
    noteFa: 'به اندازه‌گیری و تکرار آزمایش وفادار است. ادعای بی‌عدد را جدی نمی‌گیرد.',
    noteEn: 'Stays with measurement and repeated experiment. Does not take a numberless claim seriously.',
    voiceFa: 'Kore',
    voiceEn: 'af_sarah',
    voiceFree: 'female-clear',
  },
  {
    id: 'hedayat',
    nameFa: 'صادق هدایت',
    nameEn: 'Sadegh Hedayat',
    noteFa: 'با تصویر و طنز تلخ حرف می‌زند. خرافه‌ای را که خودش را عقل جا می‌زند لخت می‌کند.',
    noteEn: 'Speaks in image and bitter irony. Strips a superstition that is posing as reason.',
    voiceFa: 'Algieba',
    voiceEn: 'bm_fable',
    voiceFree: 'male-low',
  },
  {
    id: 'chomsky',
    nameFa: 'نوآم چامسکی',
    nameEn: 'Noam Chomsky',
    noteFa: 'ادعای رسمی را با سابقه و نهادِ پشتِ آن مقابله می‌کند. از کلی‌گوییِ اخلاقی رد می‌شود.',
    noteEn: 'Sets an official claim against its record and the institution behind it. Refuses moral generalities.',
    voiceFa: 'Schedar',
    voiceEn: 'am_onyx',
    voiceFree: 'male-sharp',
  },
];

export function voiceChoices(language: Language, engine: EnglishEngine): VoiceChoice[] {
  if (language === 'fa') return FA_VOICES;
  if (engine === 'fish-free') return EN_FREE_STYLES.map(({ id, label }) => ({ id, label }));
  return EN_VOICES;
}

export function defaultVoice(language: Language, side: 'a' | 'b', engine: EnglishEngine): string {
  if (language === 'fa') return side === 'a' ? 'Charon' : 'Kore';
  if (engine === 'fish-free') return side === 'a' ? 'male-low' : 'female-clear';
  return side === 'a' ? 'am_michael' : 'af_heart';
}

export function isKnownVoice(language: Language, engine: EnglishEngine, voiceId: string): boolean {
  return voiceChoices(language, engine).some((voice) => voice.id === voiceId);
}

export function fishStyleInstructions(styleId: string): string {
  return EN_FREE_STYLES.find((style) => style.id === styleId)?.instructions ?? EN_FREE_STYLES[0].instructions;
}
