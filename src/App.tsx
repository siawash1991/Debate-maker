import React, { useState, useEffect } from 'react';
import { Character, DebateResult, GenerateDebateRequest } from './types/debate';
import { PRESET_CHARACTERS, validateDebateRequest, generateDeterministicDebate } from './utils/debateLogic';
import { Navbar } from './components/Navbar';
import { DebaterCard } from './components/DebaterCard';
import { TopicSection } from './components/TopicSection';
import { CharacterModal } from './components/CharacterModal';
import { ResearchPipelineModal } from './components/ResearchPipelineModal';
import { StudioArena } from './components/StudioArena';
import { Swords, Sparkles, AlertCircle, History, Mic, Volume2 } from 'lucide-react';

export default function App() {
  const [character1, setCharacter1] = useState<Character>(PRESET_CHARACTERS[0]); // Socrates
  const [character2, setCharacter2] = useState<Character>(PRESET_CHARACTERS[1]); // Nietzsche
  const [topic, setTopic] = useState('جبر یا اختیار: آیا انسان واقعاً مختار است یا زندانیِ ژنتیک و شرایط؟');
  const [roundsCount, setRoundsCount] = useState<number>(3);
  const [moderatorEnabled, setModeratorEnabled] = useState<boolean>(true);
  const [debateTone, setDebateTone] = useState<string>('پرحرارت، مستدل و کوبنده');

  const [isLoading, setIsLoading] = useState(false);
  const [debateResult, setDebateResult] = useState<DebateResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Character selector modal state
  const [modalTarget, setModalTarget] = useState<'char1' | 'char2' | null>(null);

  // Handle autostart query parameter for testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleStartDebate();
    }
  }, []);

  const handleSelectQuickMatchup = (char1Id: string, char2Id: string, quickTopic: string) => {
    const c1 = PRESET_CHARACTERS.find((c) => c.id === char1Id);
    const c2 = PRESET_CHARACTERS.find((c) => c.id === char2Id);
    if (c1) setCharacter1(c1);
    if (c2) setCharacter2(c2);
    setTopic(quickTopic);
    setDebateResult(null);
  };

  const handleStartDebate = async () => {
    setErrorMessage(null);

    const validation = validateDebateRequest({
      character1,
      character2,
      topic,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'اطلاعات ناقص است.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: GenerateDebateRequest = {
        character1,
        character2,
        topic,
        roundsCount,
        moderatorEnabled,
        debateTone,
      };

      // Call backend API
      const resp = await fetch('/api/debate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error('خطا در ارتباط با سرور هوش مصنوعی');
      }

      const data: DebateResult = await resp.json();

      // Pre-synthesize the first turn audio if possible in background
      setDebateResult(data);
    } catch (err: any) {
      console.warn('API call failed, generating deterministic fallback:', err);
      // Fallback to deterministic full debate generator
      const fallback = generateDeterministicDebate({
        character1,
        character2,
        topic,
        roundsCount,
        moderatorEnabled,
        debateTone,
      });
      setDebateResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        onSelectQuickMatchup={handleSelectQuickMatchup}
        hasDebateHistory={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-400 hover:text-red-200 underline font-bold"
            >
              بستن
            </button>
          </div>
        )}

        {debateResult ? (
          /* Live Arena Screen */
          <StudioArena
            debate={debateResult}
            onReset={() => setDebateResult(null)}
          />
        ) : (
          /* Setup Screen: Characters & Single Topic Question */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="text-center max-w-3xl mx-auto pt-2 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>شبیه‌ساز پیشرفته مناظره، پژوهش عمیق و تولید وویس</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-snug">
                طرفین مناظره را برگزینید،
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  صداها را تنظیم کنید و موضوع را بپرسید
                </span>
              </h1>
              <p className="text-xs sm:text-base text-slate-400 mt-3 leading-relaxed">
                هوش مصنوعی در پشت صحنه پیرامون افکار هر دو چهره تحقیق کامل می‌کند، پرامپت اختصاصی می‌سازد و مناظره را با صدای زن و مرد شبیه‌سازی و پخش می‌کند.
              </p>
            </div>

            {/* Debaters Selection: Left vs Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* VS Center Badge */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl items-center justify-center font-black text-amber-400 text-sm shadow-amber-500/20">
                VS
              </div>

              {/* Debater 1 (Right in RTL) */}
              <DebaterCard
                label="طرف اول مناظره"
                side="left"
                character={character1}
                onUpdateCharacter={setCharacter1}
                onOpenCharacterSelector={() => setModalTarget('char1')}
              />

              {/* Debater 2 (Left in RTL) */}
              <DebaterCard
                label="طرف دوم مناظره"
                side="right"
                character={character2}
                onUpdateCharacter={setCharacter2}
                onOpenCharacterSelector={() => setModalTarget('char2')}
              />
            </div>

            {/* The Topic Question Section ("و فقط یک جا سوال اینو بپرسه که موضوع بحثشون چی باشه") */}
            <TopicSection
              topic={topic}
              onChangeTopic={setTopic}
              roundsCount={roundsCount}
              onChangeRoundsCount={setRoundsCount}
              moderatorEnabled={moderatorEnabled}
              onToggleModerator={setModeratorEnabled}
              debateTone={debateTone}
              onChangeDebateTone={setDebateTone}
              onStartDebate={handleStartDebate}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>استودیو مناظره هوشمند • مجهز به Gemini AI & TTS Voice Engine • طراحی شده برای کاوش حقیقت</p>
      </footer>

      {/* Character Selector Modal */}
      <CharacterModal
        isOpen={modalTarget !== null}
        onClose={() => setModalTarget(null)}
        sideTitle={modalTarget === 'char1' ? 'طرف اول' : 'طرف دوم'}
        activeCharacterId={modalTarget === 'char1' ? character1.id : character2.id}
        onSelectCharacter={(selected) => {
          if (modalTarget === 'char1') setCharacter1(selected);
          if (modalTarget === 'char2') setCharacter2(selected);
        }}
      />

      {/* Research & Generation Pipeline Progress Modal */}
      <ResearchPipelineModal
        isOpen={isLoading}
        character1={character1}
        character2={character2}
        topic={topic}
      />
    </div>
  );
}
