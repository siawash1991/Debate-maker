import React, { useState, useEffect, useRef } from 'react';
import { DebateResult, DebateTurn } from '../types/debate';
import { globalAudioPlayer } from '../utils/audioPlayer';
import { concatenateWavBase64Clips, base64ToUint8Array } from '../utils/audioConcatenator';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  FileText,
  Brain,
  Scale,
  Download,
  Share2,
  ArrowRight,
  Flame,
  Radio,
  Quote,
  Sparkles,
  Layers,
  Award,
  Music,
  CheckCircle,
} from 'lucide-react';
import { BackstageModal } from './BackstageModal';

interface StudioArenaProps {
  debate: DebateResult;
  onReset: () => void;
}

export const StudioArena: React.FC<StudioArenaProps> = ({ debate, onReset }) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'arena' | 'transcript' | 'verdict'>('arena');
  const [isBackstageOpen, setIsBackstageOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [turns, setTurns] = useState<DebateTurn[]>(debate.turns);
  const currentTurn: DebateTurn = turns[currentTurnIndex] || turns[0];

  const { character1, character2, verdict, topic } = debate;

  // Determine which side is currently speaking
  const isChar1Speaking = isPlaying && currentTurn?.speaker === 'char1';
  const isChar2Speaking = isPlaying && currentTurn?.speaker === 'char2';
  const isModeratorSpeaking = isPlaying && currentTurn?.speaker === 'moderator';

  // Count how many turns have real Gemini audio
  const turnsWithRealAudioCount = turns.filter((t) => !!t.audioBase64).length;

  // Fetch real Gemini TTS audio for a single turn if not already cached
  const ensureTurnAudio = async (turn: DebateTurn, index: number): Promise<string | undefined> => {
    if (turn.audioBase64) return turn.audioBase64;

    const isC1 = turn.speaker === 'char1';
    const isMod = turn.speaker === 'moderator';
    const activeChar = isC1 ? character1 : isMod ? { voiceName: 'Kore', gender: 'female' as const, tone: 'رسمی و متین' } : character2;

    try {
      setIsLoadingAudio(true);
      const resp = await fetch('/api/debate/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: turn.text,
          voiceName: activeChar.voiceName,
          gender: activeChar.gender,
          tone: turn.tone,
        }),
      });

      const data = await resp.json();
      if (data.audioBase64) {
        // Cache in turns state
        setTurns((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], audioBase64: data.audioBase64 };
          return next;
        });
        return data.audioBase64;
      }
    } catch (err) {
      console.warn('Failed to fetch real Gemini TTS:', err);
    } finally {
      setIsLoadingAudio(false);
    }
    return undefined;
  };

  // Batch generate Gemini TTS audio for all turns
  const handleBatchGenerateAudio = async () => {
    if (isBatchGenerating) return;
    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: turns.length });

    for (let i = 0; i < turns.length; i++) {
      setBatchProgress({ current: i + 1, total: turns.length });
      if (!turns[i].audioBase64) {
        await ensureTurnAudio(turns[i], i);
      }
    }

    setIsBatchGenerating(false);
    setBatchProgress(null);
  };

  // Play a specific turn
  const playTurnAt = async (index: number) => {
    if (index < 0 || index >= turns.length) return;
    setCurrentTurnIndex(index);
    const turn = turns[index];

    const isC1 = turn.speaker === 'char1';
    const isMod = turn.speaker === 'moderator';
    const activeChar = isC1 ? character1 : isMod ? { voiceName: 'Kore', gender: 'female' as const, tone: 'رسمی' } : character2;

    // Ensure we have real Gemini TTS audio first!
    let audioB64 = turn.audioBase64;
    if (!audioB64) {
      audioB64 = await ensureTurnAudio(turn, index);
    }

    globalAudioPlayer.playTurn(
      {
        text: turn.text,
        audioBase64: audioB64,
        speaker: turn.speaker,
        speakerName: turn.speakerName,
      },
      {
        gender: isMod ? 'female' : activeChar.gender,
        tone: turn.tone,
        rate: playbackSpeed,
      },
      {
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          if (autoAdvance && index + 1 < turns.length) {
            setTimeout(() => {
              playTurnAt(index + 1);
            }, 600);
          }
        },
        onError: () => setIsPlaying(false),
      }
    );
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      globalAudioPlayer.pause();
      setIsPlaying(false);
    } else {
      playTurnAt(currentTurnIndex);
    }
  };

  const handleNext = () => {
    if (currentTurnIndex < turns.length - 1) {
      playTurnAt(currentTurnIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentTurnIndex > 0) {
      playTurnAt(currentTurnIndex - 1);
    }
  };

  const handleRepeat = () => {
    playTurnAt(currentTurnIndex);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    globalAudioPlayer.setRate(speed);
  };

  // Stop audio on unmount & scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      globalAudioPlayer.stop();
    };
  }, []);

  // Download the complete combined audio file of the entire debate as one master WAV file
  const [isExportingAudio, setIsExportingAudio] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  const handleDownloadFullAudio = async () => {
    if (isExportingAudio) return;
    setIsExportingAudio(true);

    try {
      // 1. Ensure all turns have audio
      const completeClips: string[] = [];
      const updatedTurns = [...turns];

      for (let i = 0; i < updatedTurns.length; i++) {
        setExportProgress({ current: i + 1, total: updatedTurns.length });
        let b64 = updatedTurns[i].audioBase64;
        if (!b64) {
          b64 = await ensureTurnAudio(updatedTurns[i], i);
        }
        if (b64) {
          completeClips.push(b64);
        }
      }

      if (completeClips.length === 0) {
        alert('هیچ فایل صوتی برای استخراج یافت نشد.');
        return;
      }

      // 2. Concatenate all WAV clips with natural 0.6s pause between speakers
      const masterBlob = concatenateWavBase64Clips(completeClips, 0.6);

      // 3. Trigger download
      const safeName1 = character1.persianName.replace(/\s+/g, '_');
      const safeName2 = character2.persianName.replace(/\s+/g, '_');
      const filename = `مناظره_کامل_${safeName1}_و_${safeName2}_پادکست_صوتی.wav`;

      const downloadUrl = URL.createObjectURL(masterBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error concatenating audio:', err);
      alert('خطا در ترکیب و ساخت فایل صوتی یکپارچه.');
    } finally {
      setIsExportingAudio(false);
      setExportProgress(null);
    }
  };

  // Download a single turn's WAV audio file
  const handleDownloadSingleTurnAudio = async (turn: DebateTurn, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    let b64 = turn.audioBase64;
    if (!b64) {
      b64 = await ensureTurnAudio(turn, index);
    }
    if (!b64) return;

    const rawBytes = base64ToUint8Array(b64);
    const blob = new Blob([rawBytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `دیالوگ_${index + 1}_${turn.speakerName}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTranscript = () => {
    const textContent = `استودیو مناظره هوشمند | AI Debate Arena
موضوع مناظره: ${topic}
طرف اول: ${character1.persianName} (${character1.title})
طرف دوم: ${character2.persianName} (${character2.title})
تاریخ ضبط: ${new Date(debate.createdAt).toLocaleDateString('fa-IR')}

==================================================
متن کامل مناظره:
==================================================
${turns
  .map(
    (t, idx) =>
      `[نوبت ${idx + 1}] ${t.speakerName} (${t.tone}):\n${t.text}\n`
  )
  .join('\n')}

==================================================
تحلیل داوری و برنده نهایی:
برنده: ${verdict.winnerName}
علت: ${verdict.winnerReason}
امتیاز ${character1.persianName}: ${verdict.char1Score.total} از ۱۰۰
امتیاز ${character2.persianName}: ${verdict.char2Score.total} از ۱۰۰
جمع‌بندی نهایی: ${verdict.keyTakeaway}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مناظره_${character1.persianName}_و_${character2.persianName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const text = turns.map((t) => `${t.speakerName}: ${t.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Top Control & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>تنظیم مناظره جدید</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              ON AIR • پخش زنده استودیو
            </span>
          </div>
        </div>

        {/* Action Tabs & Real Gemini Audio Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Full Combined Audio (WAV Master File) */}
          <button
            type="button"
            onClick={handleDownloadFullAudio}
            disabled={isExportingAudio}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            title="دانلود کل مناظره به عنوان یک فایل صوتی پیوسته پادکست"
          >
            <Music className="w-3.5 h-3.5 text-slate-950" />
            {isExportingAudio ? (
              <span>در حال ساخت فایل صوتی کامل ({exportProgress?.current}/{exportProgress?.total})...</span>
            ) : (
              <span>دانلود فایل صوتی کامل مناظره (WAV) 🎙️</span>
            )}
          </button>

          {/* Batch Generate Real Gemini Audio Button */}
          <button
            type="button"
            onClick={handleBatchGenerateAudio}
            disabled={isBatchGenerating || turnsWithRealAudioCount === turns.length}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              turnsWithRealAudioCount === turns.length
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border-amber-500/40'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isBatchGenerating ? (
              <span>در حال تولید صوت هوش مصنوعی ({batchProgress?.current}/{batchProgress?.total})...</span>
            ) : turnsWithRealAudioCount === turns.length ? (
              <span>همه دیالوگ‌ها صداگذاری شدند ✅</span>
            ) : (
              <span>صداگذاری کل ({turnsWithRealAudioCount}/{turns.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsBackstageOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>اتاق تحقیق و پرامپت‌ها 🕵️‍♂️</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            title="دانلود متن کامل سناریو"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دانلود متن (TXT)</span>
          </button>
        </div>
      </div>

      {/* Real-time audio loading indicator if Gemini is generating TTS */}
      {isLoadingAudio && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>در حال دریافت صدای استودیویی با مدل واقعی Gemini 3.8 Flash Lite TTS... لطفاً چند ثانیه صبر کنید.</span>
        </div>
      )}

      {/* Arena Stage View */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Studio Lighting Accents */}
        <div
          className={`absolute top-0 right-1/4 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isChar1Speaking ? 'bg-amber-500/15 opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isChar2Speaking ? 'bg-blue-500/15 opacity-100' : 'opacity-0'
          }`}
        />

        {/* Central Topic Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-slate-400 mb-2">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>موضوع رویارویی استودیویی:</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
            «{topic}»
          </h2>
        </div>

        {/* Dual Podiums Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Debater 1 Podium (Right side in RTL) */}
          <div
            className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-500 border ${
              isChar1Speaking
                ? 'bg-amber-500/10 border-amber-500/70 shadow-2xl shadow-amber-500/10 scale-102 ring-2 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800/80 opacity-80'
            }`}
          >
            {isChar1Speaking && (
              <span className="absolute -top-3 right-6 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md animate-pulse">
                <Volume2 className="w-3 h-3" />
                در حال سخن گفتن
              </span>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={character1.avatar}
                  alt={character1.persianName}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 transition-all ${
                    isChar1Speaking
                      ? 'border-amber-400 ring-4 ring-amber-500/20'
                      : 'border-slate-700'
                  }`}
                />
                <span className="absolute -bottom-1 -left-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 font-bold">
                  {character1.voiceName}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {character1.persianName}
                </h3>
                <p className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
                  {character1.title}
                </p>
                <span className="inline-block text-[10px] text-slate-400 mt-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {character1.gender === 'female' ? 'صدای زنانه' : 'صدای مردانه'} • {character1.tone}
                </span>
              </div>
            </div>

            {/* Audio Waveform Bars Simulation */}
            <div className="flex items-end justify-center gap-1.5 h-8 p-1 rounded-xl bg-slate-950/70 border border-slate-800/60">
              {[40, 75, 100, 60, 85, 30, 95, 50, 70, 90, 45, 80].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isChar1Speaking
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-700 h-1.5'
                  }`}
                  style={{
                    height: isChar1Speaking ? `${Math.max(15, (h * (i % 2 === 0 ? 0.9 : 1.2)) % 100)}%` : '6px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Debater 2 Podium (Left side in RTL) */}
          <div
            className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-500 border ${
              isChar2Speaking
                ? 'bg-blue-500/10 border-blue-500/70 shadow-2xl shadow-blue-500/10 scale-102 ring-2 ring-blue-500/30'
                : 'bg-slate-900/60 border-slate-800/80 opacity-80'
            }`}
          >
            {isChar2Speaking && (
              <span className="absolute -top-3 right-6 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-500 text-slate-950 flex items-center gap-1 shadow-md animate-pulse">
                <Volume2 className="w-3 h-3" />
                در حال سخن گفتن
              </span>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={character2.avatar}
                  alt={character2.persianName}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 transition-all ${
                    isChar2Speaking
                      ? 'border-blue-400 ring-4 ring-blue-500/20'
                      : 'border-slate-700'
                  }`}
                />
                <span className="absolute -bottom-1 -left-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-blue-400 font-bold">
                  {character2.voiceName}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {character2.persianName}
                </h3>
                <p className="text-xs text-blue-400/90 font-medium truncate mt-0.5">
                  {character2.title}
                </p>
                <span className="inline-block text-[10px] text-slate-400 mt-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {character2.gender === 'female' ? 'صدای زنانه' : 'صدای مردانه'} • {character2.tone}
                </span>
              </div>
            </div>

            {/* Audio Waveform Bars Simulation */}
            <div className="flex items-end justify-center gap-1.5 h-8 p-1 rounded-xl bg-slate-950/70 border border-slate-800/60">
              {[50, 85, 40, 95, 65, 100, 35, 75, 80, 55, 90, 45].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isChar2Speaking
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-slate-700 h-1.5'
                  }`}
                  style={{
                    height: isChar2Speaking ? `${Math.max(15, (h * (i % 2 === 0 ? 1.1 : 0.8)) % 100)}%` : '6px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live Subtitle / Teleprompter Box */}
        <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800 p-6 sm:p-7 mb-8 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                {currentTurn.speakerName}
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                لحن: {currentTurn.tone}
              </span>
            </div>

            <span className="text-[11px] text-amber-400/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
              حرکت بلاغی: {currentTurn.rhetoricalMove}
            </span>
          </div>

          <div className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed sm:leading-loose">
            «{currentTurn.text}»
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              نوبت {currentTurnIndex + 1} از {turns.length}
            </span>
            <span className="font-mono">
              راند {Math.ceil((currentTurnIndex + 1) / 2)} • مناظره استودیو
            </span>
          </div>
        </div>

        {/* Master Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          {/* Turn step navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentTurnIndex === 0}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="نوبت قبلی"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Main Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>توقف پخش</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>پخش مناظره</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentTurnIndex >= turns.length - 1}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="نوبت بعدی"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRepeat}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="تکرار همین دیالوگ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Settings: Auto Advance & Speed */}
          <div className="flex items-center gap-4">
            {/* Auto Advance Toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
              />
              <span>پخش پیوسته (Auto-play)</span>
            </label>

            {/* Playback speed */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>سرعت:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={0.8}>0.8x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation below arena: Transcript / Verdict */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl">
        <div className="flex border-b border-slate-800 pb-3 mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('arena')}
            className={`pb-2 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'arena'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>نوار زمانی تمام نوبت‌ها ({turns.length} دیالوگ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verdict')}
            className={`pb-2 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'verdict'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>تحلیل داور هوشمند و امتیازات ⚖️</span>
          </button>
        </div>

        {/* Tab 1: Full Interactive Timeline Transcript */}
        {activeTab === 'arena' && (
          <div className="space-y-3">
            {turns.map((t, idx) => {
              const isCurrent = currentTurnIndex === idx;
              const isC1 = t.speaker === 'char1';
              const isMod = t.speaker === 'moderator';

              return (
                <div
                  key={t.id || idx}
                  onClick={() => playTurnAt(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/70 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-xs font-black ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : isC1
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : isMod
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {isCurrent ? <Play className="w-3.5 h-3.5 fill-current" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          {t.speakerName}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {t.tone}
                        </span>
                        {t.audioBase64 ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <Volume2 className="w-2.5 h-2.5" />
                            <span>صدای واقعی Gemini</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400/80 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            کلیک برای ساخت صدا
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {t.rhetoricalMove}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSingleTurnAudio(t, idx, e)}
                          className="p-1 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition"
                          title="دانلود فایل صوتی این دیالوگ (WAV)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {t.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: AI Verdict & Scorecards */}
        {activeTab === 'verdict' && (
          <div className="space-y-6">
            {/* Winner Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-blue-500/20 border border-slate-700/80 text-center">
              <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-lg sm:text-xl font-black text-white">
                نتیجه داوری هوش مصنوعی: {verdict.winnerName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
                {verdict.winnerReason}
              </p>
            </div>

            {/* Score comparison grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Char 1 Scorecard */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-amber-400">
                    امتیازات {character1.persianName}
                  </h4>
                  <span className="text-lg font-black text-amber-300">
                    {verdict.char1Score.total} / ۱۰۰
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>منطق و برهان</span>
                      <span>{verdict.char1Score.logic}٪</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${verdict.char1Score.logic}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>بلاغت و فن بیان</span>
                      <span>{verdict.char1Score.eloquence}٪</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${verdict.char1Score.eloquence}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>پاسخگویی به اتهامات و ضدحمله</span>
                      <span>{verdict.char1Score.rebuttal}٪</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${verdict.char1Score.rebuttal}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Char 2 Scorecard */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-blue-400">
                    امتیازات {character2.persianName}
                  </h4>
                  <span className="text-lg font-black text-blue-300">
                    {verdict.char2Score.total} / ۱۰۰
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>منطق و برهان</span>
                      <span>{verdict.char2Score.logic}٪</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${verdict.char2Score.logic}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>بلاغت و فن بیان</span>
                      <span>{verdict.char2Score.eloquence}٪</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${verdict.char2Score.eloquence}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>پاسخگویی به اتهامات و ضدحمله</span>
                      <span>{verdict.char2Score.rebuttal}٪</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${verdict.char2Score.rebuttal}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key takeaway */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 block mb-0.5">پیام و رهیافت نهایی برای شنونده:</strong>
                <span>{verdict.keyTakeaway}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backstage Deep Dive Modal */}
      <BackstageModal
        isOpen={isBackstageOpen}
        onClose={() => setIsBackstageOpen(false)}
        debate={debate}
      />
    </div>
  );
};
