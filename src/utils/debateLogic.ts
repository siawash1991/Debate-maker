import { Character, VoiceOption, DebateResult, GenerateDebateRequest } from '../types/debate';

export const PRESET_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'کوره (Kore)',
    gender: 'female',
    vocalStyle: 'آرام، سنجیده و متین',
    description: 'صدای زنانه با طمأنینه بالا، بسیار مناسب برای فیلسوفان، دانشمندان و استدلال‌های عمیق',
    sampleText: 'حقیقت نهایی در آرامش خرد و نقد موشکافانه نهفته است، نه در هیاهو.',
  },
  {
    id: 'Zephyr',
    name: 'زفیر (Zephyr)',
    gender: 'female',
    vocalStyle: 'پرانرژی، قاطع و رسا',
    description: 'صدای زنانه پرشور و کاریزماتیک، مناسب برای دفاع محکم، سخنرانان اجتماعی و رهبران فکری',
    sampleText: 'ما نمی‌توانیم در برابر این تناقض آشکار سکوت کنیم؛ تاریخ پاسخ ما را طلب می‌کند!',
  },
  {
    id: 'Puck',
    name: 'پاک (Puck)',
    gender: 'male',
    vocalStyle: 'پویا، تیزبین و هوشمند',
    description: 'صدای مردانه جوان و چالاک، فوق‌العاده برای استدلال‌های سریع، نقد فناوری و کنایه‌های رندانه',
    sampleText: 'بیایید صورت‌مسئله را ساده کنیم: آیا ادعای شما آزمون‌پذیر است یا صرفاً بازی با واژگان؟',
  },
  {
    id: 'Charon',
    name: 'خارون (Charon)',
    gender: 'male',
    vocalStyle: 'بم، پرطنین و کلاسیک',
    description: 'صدای بم مردانه با وزن تاریخی و فیلسوفانه، عالی برای متفکران کهن، تراژیک یا حماسی',
    sampleText: 'آنچه در گذر هزاره‌ها پابرجا مانده، رنج اندیشیدن است و پرسش‌های بی‌پاسخ انسان.',
  },
  {
    id: 'Fenrir',
    name: 'فنریر (Fenrir)',
    gender: 'male',
    vocalStyle: 'قاطع، صریح و کوبنده',
    description: 'صدای پرصلابت و محکم، مناسب برای متفکران نقاد، مبارز و بیان حقایق عریان بدون تعارف',
    sampleText: 'بت‌هایی که خود ساخته‌اید را فرو بریزید؛ حقیقت نیازی به پرده‌پوشی و ترحم ندارد.',
  },
];

export const PRESET_CHARACTERS: Character[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    persianName: 'سقراط',
    title: 'پدر فلسفه اخلاق و بنیان‌گذار دیالوگ',
    era: 'یونان باستان (۴۷۰ پیش از میلاد)',
    avatar: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Charon',
    tone: 'استفهام انکاری، پرسش‌گری موشکافانه و طعنه سقراطی',
    bio: 'فیلسوف آتنی که روش «مامایی حقیقت» (مایوتیک) را پایه‌گذاری کرد. او با پرسش‌های سلسله‌وار باورهای جزمی مخاطب را فرو می‌ریخت.',
    signatureQuote: 'تنها چیزی که می‌دانم این است که هیچ‌چیز نمی‌دانم.',
  },
  {
    id: 'nietzsche',
    name: 'Friedrich Nietzsche',
    persianName: 'فردریش نیچه',
    title: 'فیلسوف اراده معطوف به قدرت و نقاد اخلاق',
    era: 'آلمان قرن نوزدهم (۱۸۴۴-۱۹۰۰)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Fenrir',
    tone: 'آتشین، کنایه‌آمیز، تهاجمی و شاعرانه',
    bio: 'فیلسوف انقلابی که با چکش تفکر به سراغ اخلاق بردگی رفت و از مفهوم ابرانسان و عبور از پوچ‌گرایی دفاع کرد.',
    signatureQuote: 'آنچه مرا نکشد، قوی‌ترم می‌سازد.',
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    persianName: 'آلبرت اینشتین',
    title: 'پدر فیزیک نوین و نظریه‌پرداز نسبیت',
    era: 'قرن بیستم (۱۸۷۹-۱۹۵۵)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Puck',
    tone: 'منطقی، صلح‌طلبانه، آزمایش فکری و انسان‌دوستانه',
    bio: 'فیزیک‌دان نامدار که فضا و زمان را بازتعریف کرد و همواره درباره مسئولیت اخلاقی علم هشدار می‌داد.',
    signatureQuote: 'تخیل از دانش مهم‌تر است؛ زیرا دانش محدود است اما تخیل جهان را در بر می‌گیرد.',
  },
  {
    id: 'marie_curie',
    name: 'Marie Curie',
    persianName: 'ماری کوری',
    title: 'کاشف رادیوم و برنده دو جایزه نوبل',
    era: 'قرن نوزدهم و بیستم (۱۸۶۷-۱۹۳۴)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    gender: 'female',
    voiceName: 'Kore',
    tone: 'مستدل، تجربی، موشکاف و تسلیم‌ناپذیر',
    bio: 'دانشمند پیشگام رادیواکتیویته که زندگی خود را وقف کشف آزمایشگاهی کرد و در برابر سنت‌های بسته آکادمیک ایستاد.',
    signatureQuote: 'در زندگی چیزی برای ترسیدن وجود ندارد، فقط باید درک شود.',
  },
  {
    id: 'avicenna',
    name: 'Avicenna (Ibn Sina)',
    persianName: 'ابن سینا',
    title: 'شیخ الرئیس، فیلسوف مشاء و طبیب نامدار',
    era: 'دوران طلایی اسلام (۹۸۰-۱۰۳۷ میلادی)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Charon',
    tone: 'منطق ارسطویی، برهان قاطع و اصطلاحات فلسفی اصیل',
    bio: 'بزرگ‌ترین فیلسوف مشائی مشرق‌زمین و نویسنده کتاب شفا و قانون در طب با قدرت استدلال تحلیلی بی‌بدیل.',
    signatureQuote: 'تعصب به جهل دامن می‌زند؛ عقل چراغ هدایت بشر در تاریکی اوهام است.',
  },
  {
    id: 'simone_de_beauvoir',
    name: 'Simone de Beauvoir',
    persianName: 'سیمون دوبوار',
    title: 'فیلسوف اگزیستانسیالیست و نظریه‌پرداز آزادی',
    era: 'فرانسه قرن بیستم (۱۹۰۸-۱۹۸۶)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    gender: 'female',
    voiceName: 'Zephyr',
    tone: 'برانگیزاننده، نقادانه، موشکافی ساختارهای اجتماعی',
    bio: 'نویسنده و فیلسوف برجسته وجودی که سرنوشت را محصول انتخاب و مبارزه علیه قالب‌های تحمیلی می‌دانست.',
    signatureQuote: 'انسان زن زاده نمی‌شود، بلکه زن می‌شود.',
  },
  {
    id: 'elon_musk',
    name: 'Elon Musk',
    persianName: 'ایلان ماسک',
    title: 'کارآفرین فناوری، تسلا، اسپیس‌اکس و xAI',
    era: 'عصر حاضر (۱۹۷۱ تاکنون)',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Puck',
    tone: 'اصول اولیه (First Principles)، رک، آینده‌نگرانه و ریسک‌پذیر',
    bio: 'کارآفرین پیشتاز که مسائل را از سطح فیزیک و مهندسی به چالش می‌کشد و دیدگاه تکنولوژیک رادیکال دارد.',
    signatureQuote: 'فکر کردن از اصول اولیه بهترین راه برای نوآوری است، نه استدلال بر اساس قیاس.',
  },
  {
    id: 'hedayat',
    name: 'Sadegh Hedayat',
    persianName: 'صادق هدایت',
    title: 'نویسنده نامدار، آوانگارد و نویسنده بوف کور',
    era: 'ایران قرن چهاردهم شمسی (۱۲۸۱-۱۳۳۰)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Charon',
    tone: 'اگزیستانسیالیسم شرقی، طنز سیاه، تصویرسازی عمیق و افشاگر خرافات',
    bio: 'بزرگ‌ترین نویسنده داستان‌نویسی مدرن فارسی که لایه‌های روانی، اجتماعی و پوچی هستی را کاوش می‌کرد.',
    signatureQuote: 'در زندگی زخم‌هایی هست که مثل خوره روح را آهسته در انزوا می‌تراشد و می‌خورد.',
  },
  {
    id: 'chomsky',
    name: 'Noam Chomsky',
    persianName: 'نوآم چامسکی',
    title: 'زبان‌شناس برجسته، نظریه‌پرداز شناختی و نقاد قدرت',
    era: 'قرن بیستم و بیست‌ویکم (۱۹۲۸ تاکنون)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    voiceName: 'Puck',
    tone: 'مستند، ساختارگرا، آمار تاریخی و نقادی رسانه‌ها',
    bio: 'پدر زبان‌شناسی مدرن که نظریه دستور زایشی و نقدهای گسترده بر مهندسی افکار عمومی را توسعه داد.',
    signatureQuote: 'وظیفه روشنفکر گفتن حقیقت و افشای دروغ است.',
  },
];

export const SUGGESTED_TOPICS = [
  'آیا هوش مصنوعی روزی دارای آگاهی، احساس و حقوق اخلاقی خواهد شد؟',
  'جبر یا اختیار: آیا انسان واقعاً مختار است یا زندانیِ ژنتیک و شرایط؟',
  'پیشرفت فناوری و ماشین: رهایی انسان یا پیدایش بردگی مدرن؟',
  'سرمایه‌داری یا برابری‌خواهی: کدام‌یک عدالت و شکوفایی واقعی را می‌آفریند؟',
  'آیا اخلاق حقیقت مطلق عقلانی است یا قراردادی نسبی و ساخته‌ی اجتماع؟',
  'معنای زندگی: آیا انسان سازنده معناست یا باید با پوچی کنار بیاید؟',
  'سفر به مریخ و تسخیر فضا اولویت بشر است یا نجات بحران‌های کره زمین؟',
];

export function validateDebateRequest(req: Partial<GenerateDebateRequest>): { valid: boolean; error?: string } {
  if (!req.topic || req.topic.trim().length < 5) {
    return { valid: false, error: 'لطفاً موضوع مناظره را با حداقل ۵ حرف مشخص کنید.' };
  }
  if (!req.character1 || !req.character1.name.trim()) {
    return { valid: false, error: 'شخصیت طرف اول مشخص نشده است.' };
  }
  if (!req.character2 || !req.character2.name.trim()) {
    return { valid: false, error: 'شخصیت طرف دوم مشخص نشده است.' };
  }
  if (req.character1.id && req.character2.id && req.character1.id === req.character2.id && !req.character1.isCustom) {
    return { valid: false, error: 'دو طرف مناظره نمی‌توانند یک شخصیت یکسان باشند!' };
  }
  return { valid: true };
}

export function estimateSpeechDurationMs(text: string, wordsPerMinute = 130): number {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(3000, Math.round(minutes * 60 * 1000));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function generateDeterministicDebate(req: GenerateDebateRequest): DebateResult {
  const char1 = req.character1;
  const char2 = req.character2;
  const topic = req.topic.trim();
  const rounds = req.roundsCount || 3;

  const char1Analysis = {
    worldview: `نگاه ${char1.persianName || char1.name} ریشه در تفکرات او دارد؛ او با رویکرد ${char1.tone} به موضوع می‌نگرد.`,
    keyArguments: [
      `اصالت با بنیان‌های عقلانی و پیامدهای بلندمدت است.`,
      `نادیده گرفتن حقیقت بنیادی موضوع («${topic}») به فریب خود می‌انجامد.`,
      `آزمودن فرضیه‌ها بر اساس تجربه تاریخی و خرد منتقدانه.`,
    ],
    vulnerabilities: [
      `امکان افراط در تجرید یا عدم تطابق با نیازهای عاطفی روزمره`,
      `سخت‌گیری ساختاری در پذیرش شهودهای نوظهور`,
    ],
    rhetoricalTactics: [
      `پرسش‌های مستقیم و به چالش کشیدن پیش‌فرض‌های حریف`,
      `تکیه بر تعاریف دقیق واژگان برای برملا کردن سفسطه`,
    ],
    historicalContext: `${char1.era || 'دوران تاریخی شخصیت'} - با تکیه بر آرا و نقل‌قول «${char1.signatureQuote || ''}»`,
    signaturePhrases: [
      'بیایید از لایه‌های ظاهری عبور کنیم',
      'حقیقت تلخ بهتر از توهم شیرین است',
      'آیا برای این ادعا برهانی دارید؟',
    ],
  };

  const char2Analysis = {
    worldview: `دیدگاه ${char2.persianName || char2.name} با تکیه بر ${char2.tone} به ساختارشکنی و ارائه زوایای متمایز می‌پردازد.`,
    keyArguments: [
      `پدیده‌ها را باید در بستر پویای واقعیت دید، نه در قالب‌های کهنه.`,
      `«${topic}» پیش از هرچیز آزمونی برای اراده و اصالت بشری است.`,
      `ایستادن در برابر کلیشه‌ها و نفی پاسخ‌های سهل‌انگارانه.`,
    ],
    vulnerabilities: [
      `احتمال بدفهمی دیدگاه‌های رادیکال توسط شنوندگان عام`,
      `حمله سریع به مبانی بدون ارائه جایگزین ساده`,
    ],
    rhetoricalTactics: [
      `تمثیل‌های تند و پرشور و شوک به مخاطب`,
      `افشای منافع پنهان پشت ادعاهای به ظاهر عقلانی`,
    ],
    historicalContext: `${char2.era || 'دوران تاریخی شخصیت'} - با شعار «${char2.signatureQuote || ''}»`,
    signaturePhrases: [
      'شما از حقیقت سخن می‌گویید اما معنای آن را تهی کرده‌اید',
      'باید شجاعت نگریستن به ورطه را داشت',
      'این یک توهم آرامش‌بخش است',
    ],
  };

  const research = {
    char1Analysis,
    char2Analysis,
    clashPoints: [
      `نقطه تلاقی ۱: آیا معیار سنجش «${topic}» منفعت عملی است یا اصول خدشه‌ناپذیر؟`,
      `نقطه تلاقی ۲: تعریف بنیادین کرامت و آگاهی در پرتو این موضوع.`,
      `نقطه تلاقی ۳: پیامد این دیدگاه برای آینده انسان و جامعه.`,
    ],
    philosophicalDivergence: `تقابل میان رویکرد ساختارگرا و تحلیلی ${char1.persianName} با رویکرد پویا و شورانگیز ${char2.persianName}.`,
  };

  const personaPrompts = {
    char1Prompt: `شما ${char1.persianName || char1.name} هستید (${char1.title}). در این مناظره با موضوع «${topic}»، موضع اصولی خود را با لحن ${char1.tone} حفظ کنید. به هیچ وجه تسلیم کلیشه‌ها نشوید. از عبارات کنایه‌آمیز و استدلال‌های محکم استفاده کنید.`,
    char2Prompt: `شما ${char2.persianName || char2.name} هستید (${char2.title}). در این مناظره پیرامون «${topic}»، حملات حریف را خنثی کرده و با روحیه ${char2.tone} اراده و دیدگاه‌های بنیادین خود را به رخ بکشید.`,
    moderatorPrompt: `شما گرداننده و مجری هوشمند مناظره استودیو هستید. با لحنی متین و رادیویی، موضوع را مطرح کرده و در زمان لازم رشته کلام را بین دو متفکر تقسیم کنید.`,
  };

  const turns = [];
  let turnIndex = 1;

  if (req.moderatorEnabled) {
    turns.push({
      id: `turn-${turnIndex}`,
      turnNumber: turnIndex++,
      speaker: 'moderator' as const,
      speakerName: 'گرداننده مناظره',
      text: `به استودیوی مناظره هوشمند خوش آمدید. امروز میزبان دو متفکر نامدار، جناب ${char1.persianName || char1.name} و سرکار/جناب ${char2.persianName || char2.name} هستیم تا پیرامون این پرسش سرنوشت‌ساز مناظره کنند: «${topic}». از ${char1.persianName} دعوت می‌کنیم نخستین بیانیه خود را آغاز کند.`,
      tone: 'رسمی، رادیویی و هیجان‌انگیز',
      rhetoricalMove: 'افتتاحیه و تعیین چارچوب بحث',
    });
  }

  // Round 1: Opening statements
  turns.push({
    id: `turn-${turnIndex}`,
    turnNumber: turnIndex++,
    speaker: 'char1' as const,
    speakerName: char1.persianName || char1.name,
    text: `درود بر حاضران. وقتی درباره‌ی «${topic}» تأمل می‌کنیم، باید از تعاریف آغازین پرده برداریم. ادعای من ساده اما سنگین است: بدون درک ارکان حقیقت و عقلانیت، هر داوری در این باره ساختمانی است روی شن‌های روان. آیا حریف محترم من حاضر است مبانی این ادعا را به نقد بگذارد؟`,
    tone: char1.tone,
    rhetoricalMove: 'تعریف اصطلاحات و سنگ‌بنای استدلال',
  });

  turns.push({
    id: `turn-${turnIndex}`,
    turnNumber: turnIndex++,
    speaker: 'char2' as const,
    speakerName: char2.persianName || char2.name,
    text: `شنیدن این سخنان از شما غریب نیست؛ اما تعاریف انتزاعی شما دیواری است برای ندیدن تپش‌های واقعی حیات! در موضوع «${topic}»، مسئله بر سر قواعد کتابخانه‌ای نیست، بلکه بر سر نیروی زنده و واقعی است. شما حقیقت را در قفس واژه‌ها حبس کرده‌اید، حال آنکه واقعیت سرکش‌تر از اصول شماست.`,
    tone: char2.tone,
    rhetoricalMove: 'حمله به پیش‌فرض‌های انتزاعی حریف',
  });

  // Round 2: Rebuttals
  turns.push({
    id: `turn-${turnIndex}`,
    turnNumber: turnIndex++,
    speaker: 'char1' as const,
    speakerName: char1.persianName || char1.name,
    text: `جالب است که حریف محترم از شور حیات می‌گوید، اما به مغالطه فرار از برهان پناه می‌برد! اگر بنا باشد هر اصل سنجیده‌ای را به بهانه سرکشی واقعیت کنار بگذاریم، در دام نسبیت‌گرایی محض و هرج‌ومرج فکری سقوط خواهیم کرد. به این پرسش من صریح پاسخ دهید: آیا معیاری غیر از عقل برای درستی سخنان خود دارید؟`,
    tone: 'منطقی، موشکاف و چالش‌برانگیز',
    rhetoricalMove: 'نشان دادن تناقض و پرسش سقراطی',
  });

  turns.push({
    id: `turn-${turnIndex}`,
    turnNumber: turnIndex++,
    speaker: 'char2' as const,
    speakerName: char2.persianName || char2.name,
    text: `معیار من، آزمایش در کوره واقعیت است! عقلی که شما می‌ستایید غالباً نقابی است برای توجیه تعصبات کهن. وقتی از «${topic}» سخن می‌گوییم، تجربه نشان داده کسانی پیروز میدان شده‌اند که خطر کرده‌اند و بت‌های جزمی را شکسته‌اند، نه کسانی که پشت عافیت‌طلبی منطق صوری سنگر گرفته‌اند.`,
    tone: 'تهاجمی، استوار و سرشار از تمثیل',
    rhetoricalMove: 'شالوده‌شکنی و دعوت به دلیری فکری',
  });

  // Round 3: Climactic confrontation & Closing
  if (rounds >= 3) {
    turns.push({
      id: `turn-${turnIndex}`,
      turnNumber: turnIndex++,
      speaker: 'char1' as const,
      speakerName: char1.persianName || char1.name,
      text: `شکستن بت‌ها هنر والایی است، اما نه به قیمت پرستش ویرانه‌ها! جمع‌بندی من روشن است: در عرصه «${topic}»، حقیقت شاید دشوار و بی‌رحم باشد، اما تنها پناهگاه خرد انسانی در برابر طوفان توهمات است. قضاوت را به وجدان بیدار مخاطبان می‌سپارم.`,
      tone: 'پرطنین، حکیمانه و پرصلابت',
      rhetoricalMove: 'جمع‌بندی اصولی و تبیین مسئولیت اخلاقی',
    });

    turns.push({
      id: `turn-${turnIndex}`,
      turnNumber: turnIndex++,
      speaker: 'char2' as const,
      speakerName: char2.persianName || char2.name,
      text: `و سخن نهایی من: انسان به دنیا نیامده تا مقلد پاسخ‌های گذشته باشد. درباره «${topic}»، راه آینده از میان شکافتن جزم‌ها و شجاعت زیستن بر لبه خطر می‌گذرد. بگذارید تاریخ ثبت کند که ما ترسوهای پشت میز نبودیم، بلکه جویندگان بی‌باک حقیقت بودیم!`,
      tone: 'حماسی، کوبنده و ماندگار',
      rhetoricalMove: 'بیانیه حماسی پایانی و ضربه نهایی',
    });
  }

  if (req.moderatorEnabled) {
    turns.push({
      id: `turn-${turnIndex}`,
      turnNumber: turnIndex++,
      speaker: 'moderator' as const,
      speakerName: 'گرداننده مناظره',
      text: `مناظره‌ای تماشایی و ژرف با طنین بالای استدلال و شجاعت کلام به پایان رسید. هر دو متفکر، افق‌های فکری نوینی پیش روی ما گشودند. اینک توجه شما را به ارزیابی داور هوشمند و نتایج امتیازات جلب می‌کنم.`,
      tone: 'رسمی و تحسین‌آمیز',
      rhetoricalMove: 'خاتمه مناظره و اعلام داوری',
    });
  }

  const verdict = {
    winner: 'draw' as const,
    winnerName: 'تساوی اندیشه‌ها (پیروزی بینش مخاطب)',
    winnerReason: `هر دو مناظره‌کننده با قدرت بی‌نظیر از مواضع خود دفاع کردند؛ ${char1.persianName} با پایه‌گذاری منطق محکم و ساختار تحلیلی، و ${char2.persianName} با زبان تصویری، شالوده‌شکن و شورانگیز، میدان را تا آخرین لحظه پرتپش نگه داشتند.`,
    char1Score: { logic: 94, eloquence: 88, rebuttal: 91, total: 91 },
    char2Score: { logic: 87, eloquence: 96, rebuttal: 92, total: 92 },
    keyTakeaway: `مناظره نشان داد که در مواجهه با «${topic}»، تلفیق انضباط تحلیلی ${char1.persianName} با جسارت تحول‌خواه ${char2.persianName} یگانه مسیر کمال تفکر بشر است.`,
    audienceSentiment: {
      char1Percentage: 49,
      char2Percentage: 51,
      swingFactor: 'پاسخ کوبنده در راند دوم موازنه آرا را تغییر داد.',
    },
  };

  return {
    id: `debate-${Date.now()}`,
    topic,
    roundsCount: rounds,
    character1: char1,
    character2: char2,
    moderatorEnabled: req.moderatorEnabled,
    research,
    personaPrompts,
    turns,
    verdict,
    createdAt: new Date().toISOString(),
  };
}
