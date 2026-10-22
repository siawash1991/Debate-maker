import React, { useState } from 'react';
import { SUGGESTED_TOPICS } from '../utils/debateLogic';
import { HelpCircle, Sliders, Sparkles, MessageSquareText, Layers, Award, Radio } from 'lucide-react';

interface TopicSectionProps {
  topic: string;
  onChangeTopic: (topic: string) => void;
  roundsCount: number;
  onChangeRoundsCount: (rounds: number) => void;
  moderatorEnabled: boolean;
  onToggleModerator: (enabled: boolean) => void;
  debateTone: string;
  onChangeDebateTone: (tone: string) => void;
  onStartDebate: () => void;
  isLoading: boolean;
}

export const TopicSection: React.FC<TopicSectionProps> = ({
  topic,
  onChangeTopic,
  roundsCount,
  onChangeRoundsCount,
  moderatorEnabled,
  onToggleModerator,
  debateTone,
  onChangeDebateTone,
  onStartDebate,
  isLoading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const TONES = [
    { id: 'پرحرارت، مستدل و کوبنده', label: '🔥 پرحرارت و کوبنده' },
    { id: 'آکادمیک، عمیق و تحلیلی', label: '🎓 آکادمیک و تحلیلی' },
    { id: 'فلسفی، استعاری و سقراطی', label: '🏛️ فلسفی و دیالکتیک' },
    { id: 'کنایه‌آمیز با طنز سیاه و گزنده', label: '🎭 کنایه‌آمیز و تند' },
  ];

  return (
    <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Question Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>پرسش اصلی و محور رویارویی</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
          موضوع بحث و مناظره این دو متفکر چیست؟
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          موضوع دلخواه خود را بنویسید؛ اپلیکیشن در پشت‌صحنه پیرامون نظرات هر دو فرد تحقیق کرده، پرامپت اختصاصی می‌سازد و مناظره صوتی تولید می‌کند.
        </p>
      </div>

      {/* Main Topic Input Field */}
      <div className="relative max-w-3xl mx-auto mb-6">
        <div className="relative rounded-2xl p-1 bg-gradient-to-r from-amber-500/40 via-purple-500/30 to-blue-500/40 focus-within:from-amber-400 focus-within:to-cyan-400 transition-all duration-300">
          <textarea
            rows={2}
            value={topic}
            onChange={(e) => onChangeTopic(e.target.value)}
            placeholder="مثال: آیا هوش مصنوعی در نهایت آگاهی و وجدان پیدا خواهد کرد؟ یا: پیشرفت فناوری رهایی بشر است یا اسارت مدرن؟"
            className="w-full bg-slate-950 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {topic && (
          <button
            type="button"
            onClick={() => onChangeTopic('')}
            className="absolute left-3 bottom-3 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            پاک کردن
          </button>
        )}
      </div>

      {/* Suggested Topics Pills */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>موضوعات پیشنهادی داغ و پرچالش:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((suggested, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeTopic(suggested)}
              className={`text-right text-xs px-3 py-1.5 rounded-xl border transition-all ${
                topic === suggested
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {suggested}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="max-w-3xl mx-auto mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition font-semibold"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>{showAdvanced ? 'بستن تنظیمات پیشرفته استودیو' : 'تنظیمات پیشرفته استودیو (راندها، لحن، مجری)'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Rounds count */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>تعداد راندهای مناظره:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChangeRoundsCount(r)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      roundsCount === r
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {r} راند
                  </button>
                ))}
              </div>
            </div>

            {/* Moderator toggle */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>گرداننده و مجری استودیو:</span>
              </label>
              <button
                type="button"
                onClick={() => onToggleModerator(!moderatorEnabled)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                  moderatorEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{moderatorEnabled ? 'مجری فعال است 🎙️' : 'فقط مناظره دو نفره ⚔️'}</span>
              </button>
            </div>

            {/* Tone selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>لحن مناظره:</span>
              </label>
              <select
                value={debateTone}
                onChange={(e) => onChangeDebateTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="max-w-md mx-auto text-center">
        <button
          type="button"
          onClick={onStartDebate}
          disabled={isLoading || !topic.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all duration-300 transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
          <span>شروع پژوهش، ساخت پرامپت و ضبط مناظره صوتی</span>
        </button>
        <p className="text-[11px] text-slate-500 mt-2">
          هوش مصنوعی در ۳ فاز تحقیق، مهندسی پرامپت و صداگذاری زنده را انجام می‌دهد
        </p>
      </div>
    </div>
  );
};
