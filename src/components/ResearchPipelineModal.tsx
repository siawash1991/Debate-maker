import React, { useEffect, useState } from 'react';
import { Character } from '../types/debate';
import { Sparkles, Brain, Search, Mic, Swords, CheckCircle2, Loader2 } from 'lucide-react';

interface ResearchPipelineModalProps {
  isOpen: boolean;
  character1: Character;
  character2: Character;
  topic: string;
}

export const ResearchPipelineModal: React.FC<ResearchPipelineModalProps> = ({
  isOpen,
  character1,
  character2,
  topic,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const STEPS = [
    {
      title: 'تحقیق عمیق تاریخی و فلسفی (Deep Research)',
      desc: `بررسی مکاتب فکری، آرای مکتوب و استدلال‌های ${character1.persianName} و ${character2.persianName} در ارتباط با «${topic}»`,
      icon: Search,
    },
    {
      title: 'مهندسی پرامپت اختصاصی شخصیت (Persona Prompting)',
      desc: 'طراحی پرامپت سیستم هوش مصنوعی شامل لحن بیان، تمثیل‌ها، فنون مناظره و تعصبات ذهنی هر طرف',
      icon: Brain,
    },
    {
      title: 'شبیه‌سازی متن مناظره و داوری منطقی (Script Generation)',
      desc: 'تولید دیالوگ‌های نفس‌گیر رفت و برگشتی، حملات کلامی، دفاعیات و ارزیابی استدلال‌ها',
      icon: Swords,
    },
    {
      title: 'سنتز صدا و آماده‌سازی استودیو صوتی (Voice Synthesis)',
      desc: `پردازش صداهای مردانه/زنانه (${character1.voiceName} و ${character2.voiceName}) و هماهنگ‌سازی پخش صوت`,
      icon: Mic,
    },
  ];

  const LOGS = [
    `جستجوی ریشه‌های فکری ${character1.persianName} در مواجهه با موضوع...`,
    `تحلیل انتقادات تاریخی ${character2.persianName} و تدوین استراتژی پاسخ متقابل...`,
    `شناسایی سه نقطه تقابل و مغالطه‌های احتمالی طرفین...`,
    `فرمول‌بندی پرامپت سیستم (System Persona) برای بازتولید صدای فکری متفکران...`,
    `تنظیم ضرب‌آهنگ دراماتیک مناظره در راندهای آغازین، میانی و فرجامین...`,
    `آماده‌سازی مدل‌های صوتی Gemini TTS برای تولید صوت طبیعی...`,
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setActiveLogIndex(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2200);

    const logInterval = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % LOGS.length);
    }, 1800);

    return () => {
      clearInterval(stepInterval);
      clearInterval(logInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پشت صحنه هوش مصنوعی در حال پردازش</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            اتاق تحقیق و کارگردانی مناظره
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            تحقیق درباره «{character1.persianName}» و «{character2.persianName}» پیرامون:
            <span className="text-amber-400 font-semibold block mt-0.5">«{topic}»</span>
          </p>
        </div>

        {/* Steps Pipeline */}
        <div className="space-y-3.5 mb-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentStep > idx;
            const isActive = currentStep === idx;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : isDone
                    ? 'bg-emerald-500/5 border-emerald-500/30 opacity-90'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-slate-950 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isActive ? 'text-amber-300' : isDone ? 'text-emerald-300' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      مرحله {idx + 1} از ۴
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live log ticker */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono text-[11px] text-amber-400 truncate">
            {LOGS[activeLogIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};
