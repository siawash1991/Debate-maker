import React from 'react';
import { Sparkles, Mic, History, Volume2, ShieldCheck, Flame } from 'lucide-react';

interface NavbarProps {
  onSelectQuickMatchup: (char1Id: string, char2Id: string, topic: string) => void;
  onOpenHistory?: () => void;
  hasDebateHistory: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectQuickMatchup, onOpenHistory, hasDebateHistory }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Mic className="w-6 h-6 text-slate-950 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                استودیو مناظره هوشمند
                <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                  AI Debate Arena
                </span>
              </h1>
            </div>
            <p className="hidden sm:block text-xs text-slate-400">
              تحقیق عمیق متفکران • مهندسی پرامپت شخصیت • صداگذاری اختصاصی
            </p>
          </div>
        </div>

        {/* Quick Presets / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick preset dropdown button */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-400 transition"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">مناظره‌های داغ تاریخی</span>
              <span className="sm:hidden">پیش‌فرض‌ها</span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-2 hidden group-hover:block transition-all z-50 backdrop-blur-xl">
              <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 border-b border-slate-800/80 mb-1">
                رویارویی‌های کلاسیک و اندیشه‌محور:
              </div>
              <button
                type="button"
                onClick={() =>
                  onSelectQuickMatchup(
                    'socrates',
                    'nietzsche',
                    'جبر یا اختیار: آیا انسان واقعاً مختار است یا زندانیِ ژنتیک و شرایط؟'
                  )
                }
                className="w-full text-right p-2.5 rounded-xl hover:bg-slate-800/80 transition text-xs flex flex-col gap-1 text-slate-200 hover:text-amber-400"
              >
                <div className="font-bold flex items-center justify-between">
                  <span>سقراط ⚔️ فردریش نیچه</span>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">فلسفی</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">جبر یا اختیار در سرنوشت انسان</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelectQuickMatchup(
                    'einstein',
                    'marie_curie',
                    'پیشرفت فناوری و ماشین: رهایی انسان یا پیدایش بردگی مدرن؟'
                  )
                }
                className="w-full text-right p-2.5 rounded-xl hover:bg-slate-800/80 transition text-xs flex flex-col gap-1 text-slate-200 hover:text-amber-400"
              >
                <div className="font-bold flex items-center justify-between">
                  <span>آلبرت اینشتین ⚔️ ماری کوری</span>
                  <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">علمی</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">فناوری، سلاح و مسئولیت دانشمند</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelectQuickMatchup(
                    'elon_musk',
                    'chomsky',
                    'آیا هوش مصنوعی روزی دارای آگاهی، احساس و حقوق اخلاقی خواهد شد؟'
                  )
                }
                className="w-full text-right p-2.5 rounded-xl hover:bg-slate-800/80 transition text-xs flex flex-col gap-1 text-slate-200 hover:text-amber-400"
              >
                <div className="font-bold flex items-center justify-between">
                  <span>ایلان ماسک ⚔️ نوآم چامسکی</span>
                  <span className="text-[10px] text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">هوش مصنوعی</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">آینده آگاهی مصنوعی و سرنوشت بشر</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelectQuickMatchup(
                    'hedayat',
                    'avicenna',
                    'معنای زندگی: آیا انسان سازنده معناست یا باید با پوچی کنار بیاید؟'
                  )
                }
                className="w-full text-right p-2.5 rounded-xl hover:bg-slate-800/80 transition text-xs flex flex-col gap-1 text-slate-200 hover:text-amber-400"
              >
                <div className="font-bold flex items-center justify-between">
                  <span>صادق هدایت ⚔️ ابن سینا</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">اگزیستانس</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">عقلانیت مشاء در برابر پوچ‌گرایی شرقی</div>
              </button>
            </div>
          </div>

          {/* Voice Engine Tag */}
          <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>موتور صدای Gemini TTS</span>
          </div>
        </div>
      </div>
    </header>
  );
};
