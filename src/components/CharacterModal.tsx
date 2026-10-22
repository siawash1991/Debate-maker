import React, { useState } from 'react';
import { Character } from '../types/debate';
import { PRESET_CHARACTERS, PRESET_VOICES } from '../utils/debateLogic';
import { X, Search, PlusCircle, Check, Sparkles, User, BookOpen } from 'lucide-react';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (character: Character) => void;
  activeCharacterId?: string;
  sideTitle: string;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
  activeCharacterId,
  sideTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'philosophy' | 'science' | 'modern'>('all');

  // Custom Character State
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customGender, setCustomGender] = useState<'male' | 'female'>('male');
  const [customVoice, setCustomVoice] = useState<'Puck' | 'Charon' | 'Fenrir' | 'Kore' | 'Zephyr'>('Charon');
  const [customTone, setCustomTone] = useState('منطقی، صریح و منتقد');
  const [customBio, setCustomBio] = useState('');
  const [customQuote, setCustomQuote] = useState('');

  if (!isOpen) return null;

  const filteredCharacters = PRESET_CHARACTERS.filter((c) => {
    const matchesSearch =
      c.persianName.includes(searchQuery) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.includes(searchQuery) ||
      c.bio.includes(searchQuery);
    return matchesSearch;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newChar: Character = {
      id: `custom-${Date.now()}`,
      name: customName,
      persianName: customName,
      title: customTitle || 'متفکر مستقل',
      era: 'شخصیت سفارشی معاصر',
      avatar:
        customGender === 'female'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      gender: customGender,
      voiceName: customVoice,
      tone: customTone || 'مستدل و قاطع',
      bio: customBio || 'شخصیت ساخته شده توسط کاربر برای مناظره پیرامون ایده‌ها و اندیشه‌ها.',
      signatureQuote: customQuote || 'اندیشه نقادانه یگانه راه سنجش حقیقت است.',
      isCustom: true,
    };

    onSelectCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>انتخاب مناظره‌کننده برای {sideTitle}</span>
              <span className="text-xs font-normal text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                گالری بزرگان اندیشه
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              شخصیت مورد نظر را انتخاب کنید یا یک چهره دلخواه بسازید
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>شخصیت‌های آماده تاریخی و مدرن ({PRESET_CHARACTERS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>ساخت شخصیت دلخواه / سفارشی</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'presets' ? (
            <div>
              {/* Search bar */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی نام فیلسوف، دانشمند، حوزه فکری..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Characters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredCharacters.map((c) => {
                  const isSelected = activeCharacterId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCharacter(c);
                        onClose();
                      }}
                      className={`text-right p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <img
                        src={c.avatar}
                        alt={c.persianName}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition truncate">
                            {c.persianName}
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                              c.gender === 'female'
                                ? 'bg-pink-500/15 text-pink-300'
                                : 'bg-cyan-500/15 text-cyan-300'
                            }`}
                          >
                            {c.gender === 'female' ? 'زن' : 'مرد'}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-400/90 truncate mt-0.5">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                          {c.bio}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Character Form */
            <form onSubmit={handleCreateCustom} className="space-y-4 max-w-xl mx-auto">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                هر شخصیتی که می‌خواهید بسازید! هوش مصنوعی در پس‌زمینه زندگی، آثار و سبک استدلال او را برای مناظره شبیه‌سازی خواهد کرد.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  نام شخصیت (فارسی یا انگلیسی): *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثلاً: آرتور شوپنهاور، هوش مصنوعی آینده، یک پزشک سنتی..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  عنوان یا تخصص:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="مثلاً: فیلسوف بدبین، پژوهشگر سایبرنتیک، فعال محیط‌زیست..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    جنسیت:
                  </label>
                  <select
                    value={customGender}
                    onChange={(e) => {
                      const g = e.target.value as 'male' | 'female';
                      setCustomGender(g);
                      setCustomVoice(g === 'female' ? 'Kore' : 'Charon');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="male">مرد 👨</option>
                    <option value="female">زن 👩</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    مدل صدای اولیه:
                  </label>
                  <select
                    value={customVoice}
                    onChange={(e) => setCustomVoice(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {PRESET_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gender === 'female' ? 'زن' : 'مرد'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  لحن و سبک استدلال:
                </label>
                <input
                  type="text"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  placeholder="مثلاً: آتشین و کنایه‌آمیز، آرام و ریاضی‌گونه، هیجانی و کوبنده..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  شرح کوتاه دیدگاه یا پیشینه فکری:
                </label>
                <textarea
                  rows={2}
                  value={customBio}
                  onChange={(e) => setCustomBio(e.target.value)}
                  placeholder="خلاصه‌ای از جهان‌بینی یا باوری که این شخصیت قرار است در مناظره نمایندگی کند..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  جمله یا شعار کلیدی (اختیاری):
                </label>
                <input
                  type="text"
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  placeholder="مثلاً: جهان ساخته اراده ماست..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>تأیید و افزودن به استودیوی مناظره</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
