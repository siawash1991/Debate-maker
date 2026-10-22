import React, { useState } from 'react';
import { Character, VoiceOption } from '../types/debate';
import { PRESET_VOICES } from '../utils/debateLogic';
import { globalAudioPlayer } from '../utils/audioPlayer';
import { UserCheck, Volume2, Sparkles, RefreshCw, Play, Square, Quote } from 'lucide-react';

interface DebaterCardProps {
  label: string;
  side: 'left' | 'right';
  character: Character;
  onUpdateCharacter: (updated: Character) => void;
  onOpenCharacterSelector: () => void;
}

export const DebaterCard: React.FC<DebaterCardProps> = ({
  label,
  side,
  character,
  onUpdateCharacter,
  onOpenCharacterSelector,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Available voices filtered or highlighted by character gender
  const currentVoice = PRESET_VOICES.find((v) => v.id === character.voiceName) || PRESET_VOICES[0];

  const handleGenderChange = (gender: 'male' | 'female') => {
    // If changing gender, choose a suitable default voice
    const defaultVoice = gender === 'female' ? 'Kore' : 'Charon';
    onUpdateCharacter({
      ...character,
      gender,
      voiceName: defaultVoice,
    });
  };

  const handleVoiceChange = (voiceId: 'Puck' | 'Charon' | 'Fenrir' | 'Kore' | 'Zephyr') => {
    const voiceObj = PRESET_VOICES.find((v) => v.id === voiceId);
    onUpdateCharacter({
      ...character,
      voiceName: voiceId,
      gender: voiceObj?.gender || character.gender,
    });
  };

  const handlePreviewVoice = async () => {
    if (isPlayingPreview) {
      globalAudioPlayer.stop();
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);

    try {
      // Try backend TTS first
      const resp = await fetch('/api/debate/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentVoice.sampleText,
          voiceName: character.voiceName,
          gender: character.gender,
          tone: character.tone,
        }),
      });

      const data = await resp.json();

      globalAudioPlayer.playTurn(
        {
          text: currentVoice.sampleText,
          audioBase64: data.audioBase64,
          speaker: side === 'left' ? 'char1' : 'char2',
          speakerName: character.persianName || character.name,
        },
        {
          gender: character.gender,
          tone: character.tone,
        },
        {
          onStart: () => setIsPlayingPreview(true),
          onEnd: () => setIsPlayingPreview(false),
          onError: () => setIsPlayingPreview(false),
        }
      );
    } catch (e) {
      // Web speech fallback
      globalAudioPlayer.playTurn(
        {
          text: currentVoice.sampleText,
          speaker: side === 'left' ? 'char1' : 'char2',
          speakerName: character.persianName || character.name,
        },
        {
          gender: character.gender,
          tone: character.tone,
        },
        {
          onEnd: () => setIsPlayingPreview(false),
          onError: () => setIsPlayingPreview(false),
        }
      );
    }
  };

  const borderAccent =
    side === 'left'
      ? 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
      : 'from-blue-500/20 to-cyan-500/10 border-blue-500/30';

  const badgeColor =
    side === 'left'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-b ${borderAccent} border bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-opacity-60 flex flex-col justify-between`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 ${badgeColor}`}>
          <UserCheck className="w-3.5 h-3.5" />
          {label}
        </span>

        <button
          type="button"
          onClick={onOpenCharacterSelector}
          className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
        >
          <RefreshCw className="w-3 h-3 text-amber-400" />
          <span>تغییر شخصیت</span>
        </button>
      </div>

      {/* Main Character Presentation */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative shrink-0">
          <img
            src={character.avatar}
            alt={character.persianName || character.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-700 shadow-xl"
            onError={(e) => {
              // fallback avatar
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
            }}
          />
          <span
            className={`absolute -bottom-1 -right-1 text-[11px] px-2 py-0.5 rounded-lg border font-bold ${
              character.gender === 'female'
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {character.gender === 'female' ? 'زن' : 'مرد'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-black text-white truncate">
            {character.persianName || character.name}
          </h3>
          <p className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
            {character.title}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            {character.bio}
          </p>
        </div>
      </div>

      {/* Signature Quote */}
      {character.signatureQuote && (
        <div className="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 italic flex items-start gap-2">
          <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 opacity-70" />
          <span className="line-clamp-2 leading-relaxed">«{character.signatureQuote}»</span>
        </div>
      )}

      {/* Controls: Gender & Voice Selection */}
      <div className="space-y-4 pt-3 border-t border-slate-800/80">
        {/* Gender Toggle */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            جنسیت گوینده:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleGenderChange('male')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                character.gender === 'male'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>مرد 👨</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('female')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                character.gender === 'female'
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>زن 👩</span>
            </button>
          </div>
        </div>

        {/* Voice Model Selector & Test Voice */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              مدل صدا (Voice Profile):
            </label>
            <button
              type="button"
              onClick={handlePreviewVoice}
              className="text-[11px] flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30 transition"
              title="پخش نمونه صدا"
            >
              {isPlayingPreview ? (
                <>
                  <Square className="w-3 h-3 text-red-400 fill-current" />
                  <span>توقف تست</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-amber-400 fill-current" />
                  <span>تست صدا</span>
                </>
              )}
            </button>
          </div>

          <select
            value={character.voiceName}
            onChange={(e) => handleVoiceChange(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
          >
            {PRESET_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gender === 'female' ? 'زنانه' : 'مردانه'} - {v.vocalStyle})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
            {currentVoice.description}
          </p>
        </div>

        {/* Tone descriptor tag */}
        <div className="text-[11px] bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/60 text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">سبک استدلال: {character.tone}</span>
        </div>
      </div>
    </div>
  );
};
