import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { DebateScript, DebateTurn, EnglishEngine, Language, ResearchDossier } from '../shared/types';
import { defaultVoice, isKnownVoice, PRESETS, voiceChoices } from '../shared/voices';
import { validateSetup } from '../shared/validate';
import { AccessError, checkHealth, researchDebater, setAccessKey, synthesizeTurn, writeDebate } from './api';

interface Side {
  name: string;
  note: string;
  voiceId: string;
}

const FORM_KEY = 'debate-form-v1';

export default function App() {
  const stored = useMemo(readForm, []);
  const [language, setLanguage] = useState<Language>(stored?.language ?? 'fa');
  const [engine, setEngine] = useState<EnglishEngine>(stored?.engine ?? 'kokoro');
  const [rounds, setRounds] = useState(stored?.rounds ?? 3);
  const [topic, setTopic] = useState(stored?.topic ?? 'آیا انسان در عمل مختار است، یا انتخابش از قبل شکل گرفته؟');
  const [a, setA] = useState<Side>(stored?.a ?? sideFromPreset('socrates', 'fa', 'kokoro'));
  const [b, setB] = useState<Side>(stored?.b ?? sideFromPreset('nietzsche', 'fa', 'kokoro'));
  const [dossierA, setDossierA] = useState<ResearchDossier | null>(null);
  const [dossierB, setDossierB] = useState<ResearchDossier | null>(null);
  const [script, setScript] = useState<DebateScript | null>(null);
  const [audio, setAudio] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [accessDraft, setAccessDraft] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopRef = useRef(false);
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    sessionStorage.setItem(FORM_KEY, JSON.stringify({ language, engine, rounds, topic, a, b }));
  }, [language, engine, rounds, topic, a, b]);

  useEffect(() => {
    checkHealth()
      .then(() => setNeedsKey(false))
      .catch((caught) => {
        if (caught instanceof AccessError) setNeedsKey(true);
      });
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const voices = voiceChoices(language, engine);

  function updateSide(current: Side, next: Side, apply: (side: Side) => void) {
    const contentChanged = next.name !== current.name || next.note !== current.note;
    apply(next);
    if (contentChanged) clearWork();
    else if (next.voiceId !== current.voiceId) clearAudio();
  }

  function changeLanguage(next: Language) {
    setLanguage(next);
    setA((side) => localizeSide(side, language, next, 'a', engine));
    setB((side) => localizeSide(side, language, next, 'b', engine));
    clearWork();
  }

  function changeEngine(next: EnglishEngine) {
    setEngine(next);
    setA((side) => withVoice(side, language, 'a', next));
    setB((side) => withVoice(side, language, 'b', next));
    clearAudio();
  }

  function clearAudio() {
    stopPlayback();
    setAudio({});
  }

  function clearScript() {
    setScript(null);
    clearAudio();
  }

  function clearWork() {
    setDossierA(null);
    setDossierB(null);
    clearScript();
  }

  async function saveAccess(event: FormEvent) {
    event.preventDefault();
    setAccessKey(accessDraft);
    setError('');
    try {
      await checkHealth();
      setNeedsKey(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'کلید پذیرفته نشد.');
    }
  }

  async function start() {
    const validation = validateSetup({ language, topic, rounds, engine, a, b });
    if (!validation.ok) {
      setError(validation.error || 'اطلاعات ناقص است.');
      return;
    }

    stopPlayback();
    setBusy(true);
    setError('');
    setScript(null);
    setAudio({});

    try {
      let left = dossierA;
      let right = dossierB;

      if (!left || !right) {
        setStatus('تحقیق هر طرف، جدا از هم');
        const tasks: Promise<unknown>[] = [];
        if (!left) {
          tasks.push(
            researchDebater({
              name: a.name.trim(),
              note: a.note.trim(),
              topic: topic.trim(),
              opponentName: b.name.trim(),
              language,
            }).then((value) => {
              left = value;
              setDossierA(value);
            }),
          );
        }
        if (!right) {
          tasks.push(
            researchDebater({
              name: b.name.trim(),
              note: b.note.trim(),
              topic: topic.trim(),
              opponentName: a.name.trim(),
              language,
            }).then((value) => {
              right = value;
              setDossierB(value);
            }),
          );
        }
        const settled = await Promise.allSettled(tasks);
        const failed = settled.find((item) => item.status === 'rejected') as PromiseRejectedResult | undefined;
        if (!left || !right) {
          throw new Error(messageOf(failed?.reason) || 'تحقیق یکی از دو طرف انجام نشد.');
        }
      }

      setStatus('نوشتن مناظره از روی دو پرونده');
      const nextScript = await writeDebate({
        language,
        topic: topic.trim(),
        rounds,
        speakerA: { name: a.name.trim(), note: a.note.trim() },
        speakerB: { name: b.name.trim(), note: b.note.trim() },
        researchA: left,
        researchB: right,
      });
      setScript(nextScript);
      setStatus('');
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (caught) {
      if (caught instanceof AccessError) setNeedsKey(true);
      setError(caught instanceof Error ? caught.message : 'ساخت مناظره ناموفق بود.');
      setStatus('');
    } finally {
      setBusy(false);
    }
  }

  async function ensureAudio(turn: DebateTurn): Promise<string> {
    const cached = audio[turn.id];
    if (cached) return cached;
    const side = turn.speaker === 'a' ? a : b;
    const result = await synthesizeTurn({
      text: turn.text,
      language,
      voiceId: side.voiceId,
      delivery: turn.delivery,
      engine,
    });
    setAudio((current) => ({ ...current, [turn.id]: result.audioBase64 }));
    return result.audioBase64;
  }

  async function playTurn(turn: DebateTurn) {
    stopRef.current = false;
    setError('');
    try {
      setStatus('ساخت صدا');
      const clip = await ensureAudio(turn);
      if (stopRef.current) return;
      setStatus('');
      await playClip(clip, turn.id);
    } catch (caught) {
      if (caught instanceof AccessError) setNeedsKey(true);
      setError(caught instanceof Error ? caught.message : 'صدا ساخته نشد.');
      setStatus('');
    }
  }

  async function playAll() {
    if (!script) return;
    stopRef.current = false;
    setError('');
    try {
      for (const turn of script.turns) {
        if (stopRef.current) break;
        setStatus(`صدای ${turn.speakerName}`);
        const clip = await ensureAudio(turn);
        if (stopRef.current) break;
        await playClip(clip, turn.id);
      }
    } catch (caught) {
      if (caught instanceof AccessError) setNeedsKey(true);
      setError(caught instanceof Error ? caught.message : 'پخش کامل ناموفق بود.');
    } finally {
      setStatus('');
      setPlayingId(null);
    }
  }

  function playClip(base64: string, id: string): Promise<void> {
    audioRef.current?.pause();
    const element = new Audio(`data:audio/mpeg;base64,${base64}`);
    audioRef.current = element;
    setPlayingId(id);
    return new Promise((resolve, reject) => {
      element.onended = () => {
        if (audioRef.current === element) setPlayingId(null);
        resolve();
      };
      element.onerror = () => reject(new Error('پخش این قطعه ناموفق بود.'));
      element.play().catch(() => reject(new Error('مرورگر پخش صدا را مسدود کرد.')));
    });
  }

  function stopPlayback() {
    stopRef.current = true;
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  }

  function download(turn: DebateTurn) {
    const clip = audio[turn.id];
    if (!clip) return;
    const link = document.createElement('a');
    link.href = `data:audio/mpeg;base64,${clip}`;
    link.download = `${turn.speakerName}-${turn.id}.mp3`;
    link.click();
  }

  async function copyTranscript() {
    if (!script) return;
    const lines = [`${topic.trim()}`, '', script.premise, ''];
    for (const turn of script.turns) lines.push(turn.speakerName, turn.text, '');
    await navigator.clipboard.writeText(lines.join('\n'));
    setStatus('متن کپی شد');
    window.setTimeout(() => setStatus(''), 1500);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">مناظره</h1>
        <p className="mt-2 text-sm leading-7 text-[#5f5a53]">
          برای هر طرف یک تحقیق جدا انجام می‌شود. بعد از آن، متن طوری نوشته می‌شود که هر نوبت به حرف قبلی جواب بدهد.
        </p>
      </header>

      {needsKey && (
        <form onSubmit={saveAccess} className="mb-6 flex gap-2">
          <input
            className="field"
            type="password"
            value={accessDraft}
            onChange={(event) => setAccessDraft(event.target.value)}
            placeholder="کلید دسترسی"
            autoComplete="off"
          />
          <button className="btn btn-primary" type="submit">
            ورود
          </button>
        </form>
      )}

      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`btn ${language === 'fa' ? 'btn-active' : ''}`} onClick={() => changeLanguage('fa')}>
            فارسی
          </button>
          <button type="button" className={`btn ${language === 'en' ? 'btn-active' : ''}`} onClick={() => changeLanguage('en')}>
            English
          </button>
          <label className="ms-auto flex items-center gap-2 text-sm">
            راند
            <select
              className="field w-auto"
              value={rounds}
              onChange={(event) => {
                setRounds(Number(event.target.value));
                clearScript();
              }}
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>

        {language === 'en' && (
          <label className="block text-sm">
            <span className="mb-1 block text-[#5f5a53]">صدای انگلیسی</span>
            <select className="field" value={engine} onChange={(event) => changeEngine(event.target.value as EnglishEngine)}>
              <option value="kokoro">صداهای جدا (Kokoro، هزینه خیلی کم)</option>
              <option value="fish-free">رایگان (Fish، هر دو طرف یک رنگ صدا)</option>
            </select>
          </label>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <SideFields
            title="طرف اول"
            side={a}
            language={language}
            voices={voices}
            onChange={(next) => updateSide(a, next, setA)}
            onPreset={(id) => {
              setA(sideFromPreset(id, language, engine));
              clearWork();
            }}
          />
          <SideFields
            title="طرف دوم"
            side={b}
            language={language}
            voices={voices}
            onChange={(next) => updateSide(b, next, setB)}
            onPreset={(id) => {
              setB(sideFromPreset(id, language, engine));
              clearWork();
            }}
          />
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-[#5f5a53]">موضوع، به زبان همین نسخه</span>
          <textarea
            className="field min-h-24 leading-7"
            dir={language === 'en' ? 'ltr' : 'rtl'}
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              clearWork();
            }}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setA(b);
              setB(a);
              clearWork();
            }}
          >
            جابه‌جایی دو طرف
          </button>
          <button type="button" className="btn btn-primary" onClick={start} disabled={busy}>
            {busy ? 'در حال ساخت' : 'ساخت مناظره'}
          </button>
        </div>

        {status && <p className="text-sm text-[#5f5a53]">{status}</p>}
        {error && <p className="text-sm leading-7 wrap-anywhere text-[#8a3b2c]">{error}</p>}
      </section>

      {(dossierA || dossierB) && (
        <section className="mt-8 grid gap-3 md:grid-cols-2">
          <Dossier title={a.name} dossier={dossierA} />
          <Dossier title={b.name} dossier={dossierB} />
        </section>
      )}

      {script && (
        <section ref={resultRef} className="mt-8" dir={language === 'en' ? 'ltr' : 'rtl'}>
          {script.premise && <p className="mb-4 text-sm leading-7 text-[#5f5a53]">{script.premise}</p>}
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={playAll} disabled={busy}>
              پخش همه
            </button>
            <button type="button" className="btn" onClick={stopPlayback}>
              توقف
            </button>
            <button type="button" className="btn" onClick={copyTranscript}>
              کپی متن
            </button>
          </div>
          <ol className="space-y-4">
            {script.turns.map((turn, index) => (
              <li key={turn.id} className={`rounded-lg border bg-white p-4 ${playingId === turn.id ? 'border-[#221f1b]' : 'border-[#e3dfd8]'}`}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold">
                    {index + 1}. {turn.speakerName}
                  </h2>
                  <span className="text-xs text-[#8a847b]">{turn.move}</span>
                </div>
                <p className="leading-8">{turn.text}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn" onClick={() => playTurn(turn)}>
                    {playingId === turn.id ? 'در حال پخش' : audio[turn.id] ? 'پخش' : 'ساخت صدا و پخش'}
                  </button>
                  <button type="button" className="btn" onClick={() => download(turn)} disabled={!audio[turn.id]}>
                    دانلود
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}

function SideFields({
  title,
  side,
  language,
  voices,
  onChange,
  onPreset,
}: {
  title: string;
  side: Side;
  language: Language;
  voices: { id: string; label: string }[];
  onChange: (side: Side) => void;
  onPreset: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-[#e3dfd8] bg-white p-4">
      <legend className="px-1 text-sm font-medium">{title}</legend>
      <select className="field" value="" onChange={(event) => event.target.value && onPreset(event.target.value)}>
        <option value="">انتخاب آماده</option>
        {PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {language === 'fa' ? preset.nameFa : preset.nameEn}
          </option>
        ))}
      </select>
      <input
        className="field"
        dir={language === 'en' ? 'ltr' : 'rtl'}
        value={side.name}
        onChange={(event) => onChange({ ...side, name: event.target.value })}
        placeholder="نام"
      />
      <textarea
        className="field min-h-20 leading-7"
        dir={language === 'en' ? 'ltr' : 'rtl'}
        value={side.note}
        onChange={(event) => onChange({ ...side, note: event.target.value })}
        placeholder="لحن و موضع. اگر خالی باشد از سابقه عمومی استفاده می‌شود."
      />
      <select className="field" value={side.voiceId} onChange={(event) => onChange({ ...side, voiceId: event.target.value })}>
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}

function Dossier({ title, dossier }: { title: string; dossier: ResearchDossier | null }) {
  if (!dossier) return <p className="text-sm text-[#8a3b2c]">پرونده {title} آماده نیست.</p>;
  return (
    <details className="rounded-lg border border-[#e3dfd8] bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium">پرونده {title}</summary>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[#3c3832]">
        <p>{dossier.stance}</p>
        <List label="ادعاها" items={dossier.coreClaims} />
        <List label="جایی که ضربه می‌خورد" items={dossier.pressurePoints} />
        <p className="text-[#5f5a53]">{dossier.method}</p>
      </div>
    </details>
  );
}

function List({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[#8a847b]">{label}</p>
      <ul className="list-disc ps-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function sideFromPreset(id: string, language: Language, engine: EnglishEngine): Side {
  const preset = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
  return {
    name: language === 'fa' ? preset.nameFa : preset.nameEn,
    note: language === 'fa' ? preset.noteFa : preset.noteEn,
    voiceId: language === 'fa' ? preset.voiceFa : engine === 'fish-free' ? preset.voiceFree : preset.voiceEn,
  };
}

function localizeSide(
  side: Side,
  from: Language,
  to: Language,
  which: 'a' | 'b',
  engine: EnglishEngine,
): Side {
  const preset = PRESETS.find((item) => (from === 'fa' ? item.nameFa : item.nameEn) === side.name.trim());
  if (!preset) return withVoice(side, to, which, engine);
  const previousNote = from === 'fa' ? preset.noteFa : preset.noteEn;
  return {
    name: to === 'fa' ? preset.nameFa : preset.nameEn,
    note: side.note.trim() === previousNote ? (to === 'fa' ? preset.noteFa : preset.noteEn) : side.note,
    voiceId: to === 'fa' ? preset.voiceFa : engine === 'fish-free' ? preset.voiceFree : preset.voiceEn,
  };
}

function withVoice(side: Side, language: Language, which: 'a' | 'b', engine: EnglishEngine): Side {
  if (isKnownVoice(language, engine, side.voiceId)) return side;
  return { ...side, voiceId: defaultVoice(language, which, engine) };
}

function readForm(): { language: Language; engine: EnglishEngine; rounds: number; topic: string; a: Side; b: Side } | null {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    return raw ? (JSON.parse(raw) as { language: Language; engine: EnglishEngine; rounds: number; topic: string; a: Side; b: Side }) : null;
  } catch {
    return null;
  }
}

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : '';
}
