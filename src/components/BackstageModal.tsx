import React, { useState } from 'react';
import { DebateResult } from '../types/debate';
import { X, Search, Brain, ShieldAlert, Target, BookOpen, Quote, Copy, Check } from 'lucide-react';

interface BackstageModalProps {
  isOpen: boolean;
  onClose: () => void;
  debate: DebateResult;
}

export const BackstageModal: React.FC<BackstageModalProps> = ({ isOpen, onClose, debate }) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'research' | 'clashes'>('prompts');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const { research, personaPrompts, character1, character2, topic } = debate;

  const handleDownloadDossier = () => {
    const dataStr = JSON.stringify(
      {
        topic: debate.topic,
        character1: debate.character1,
        character2: debate.character2,
        research: debate.research,
        personaPrompts: debate.personaPrompts,
        verdict: debate.verdict,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `پرونده_پژوهشی_${character1.persianName}_و_${character2.persianName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                پشت صحنه هوش مصنوعی
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                پرامپت‌های اختصاصی و پرونده پژوهشی
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مشاهده تحقیقات عمیق، دایره استدلال‌ها و پرامپت‌های سیستمی تولید شده برای هر شخصیت
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDossier}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-bold"
              title="دانلود فایل JSON پرونده"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>دانلود کل پرونده (JSON)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'prompts'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>پرامپت‌های مهندسی‌شده شخصیت‌ها (Persona Prompts)</span>
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'research'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>پرونده تحقیق فکری هر متفکر</span>
          </button>
          <button
            onClick={() => setActiveTab('clashes')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'clashes'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>نقاط تلاقی و تعارض فلسفی</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'prompts' && (
            <div className="space-y-5">
              {/* Character 1 Prompt */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={character1.avatar}
                      alt={character1.persianName}
                      className="w-9 h-9 rounded-xl object-cover border border-amber-500/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        پرامپت اختصاصی {character1.persianName}
                      </h4>
                      <span className="text-[10px] text-amber-400">
                        {character1.title} • صدای {character1.voiceName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(personaPrompts.char1Prompt, 'char1')}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    {copiedPrompt === 'char1' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی پرامپت</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {personaPrompts.char1Prompt}
                </div>
              </div>

              {/* Character 2 Prompt */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={character2.avatar}
                      alt={character2.persianName}
                      className="w-9 h-9 rounded-xl object-cover border border-blue-500/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        پرامپت اختصاصی {character2.persianName}
                      </h4>
                      <span className="text-[10px] text-blue-400">
                        {character2.title} • صدای {character2.voiceName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(personaPrompts.char2Prompt, 'char2')}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
                  >
                    {copiedPrompt === 'char2' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی پرامپت</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {personaPrompts.char2Prompt}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Char 1 Research Dossier */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-500/30">
                <h4 className="text-sm font-black text-amber-400 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>پرونده فکری {character1.persianName}</span>
                </h4>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {research.char1Analysis.worldview}
                </p>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      استدلال‌های اصلی پیرامون موضوع:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {research.char1Analysis.keyArguments.map((arg, idx) => (
                        <li key={idx}>{arg}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      نقاط آسیب‌پذیری و چالش‌ها:
                    </span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {research.char1Analysis.vulnerabilities.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Char 2 Research Dossier */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-blue-500/30">
                <h4 className="text-sm font-black text-blue-400 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>پرونده فکری {character2.persianName}</span>
                </h4>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {research.char2Analysis.worldview}
                </p>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      استدلال‌های اصلی پیرامون موضوع:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {research.char2Analysis.keyArguments.map((arg, idx) => (
                        <li key={idx}>{arg}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      نقاط آسیب‌پذیری و چالش‌ها:
                    </span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {research.char2Analysis.vulnerabilities.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clashes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 mb-1">
                  خلاصه تضاد و واگرایی فلسفی:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {research.philosophicalDivergence}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-2.5">
                  نقاط اصطکاک و نبرد استدلال‌ها:
                </h4>
                <div className="space-y-2">
                  {research.clashPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
