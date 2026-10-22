import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateDeterministicDebate, validateDebateRequest } from './src/utils/debateLogic.ts';
import { GenerateDebateRequest } from './src/types/debate.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Generate full debate with research and persona system prompts
app.post('/api/debate/generate', async (req, res) => {
  try {
    const debateReq: GenerateDebateRequest = req.body;
    const validation = validateDebateRequest(debateReq);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // If Gemini API is available, conduct real AI research, persona prompt generation and dialogue simulation
    if (ai) {
      try {
        const char1 = debateReq.character1;
        const char2 = debateReq.character2;
        const topic = debateReq.topic;
        const rounds = debateReq.roundsCount || 3;
        const moderator = debateReq.moderatorEnabled;

        const systemPrompt = `شما یک کارگردان، پژوهشگر فلسفی و تهیه‌کننده ارشد مناظره‌های فکری و تاریخی به زبان فارسی هستید.
وظیفه شما اجرای یک فرآیند ۴ مرحله‌ای کامل است:
۱. تحقیق عمیق تاریخی و فلسفی روی دو شخصیت «${char1.persianName || char1.name}» و «${char2.persianName || char2.name}» در ارتباط مستقیم با موضوع «${topic}».
۲. نگارش پرامپت اختصاصی سیستم (System Persona Prompt) برای هر شخصیت که دقیقاً لحن، دایره واژگان، تکنیک‌های مغالطه و برهان، و نقاط قوت و ضعف آن‌ها را شبیه‌سازی کند.
۳. شبیه‌سازی یک مناظره چندراندی نفس‌گیر، زنده و پرکشش بین این دو شخصیت${moderator ? ' به همراه یک مجری/گرداننده هوشمند' : ''}.
۴. داوری دقیق، بی‌طرفانه و امتیازدهی به منطق، بلاغت و قدرت پاسخگویی هر دو طرف.

پاسخ را دقیقاً در قالب فرمت JSON معتبر زیر برگردانید (بدون هیچ متن اضافی قبل یا بعد از JSON):
{
  "research": {
    "char1Analysis": {
      "worldview": "شرح دقیق جهان‌بینی و موضع طرف اول درباره موضوع",
      "keyArguments": ["استدلال کلیدی ۱", "استدلال کلیدی ۲", "استدلال کلیدی ۳"],
      "vulnerabilities": ["نقطه ضعف فکری یا تناقض احتمالی ۱", "نقطه ضعف ۲"],
      "rhetoricalTactics": ["تاکتیک کلامی ۱", "تاکتیک ۲"],
      "historicalContext": "بستر تاریخی و نقل‌قول مرتبط",
      "signaturePhrases": ["تکیه‌کلام ۱", "تکیه‌کلام ۲"]
    },
    "char2Analysis": {
      "worldview": "شرح دقیق جهان‌بینی و موضع طرف دوم درباره موضوع",
      "keyArguments": ["استدلال کلیدی ۱", "استدلال کلیدی ۲", "استدلال کلیدی ۳"],
      "vulnerabilities": ["نقطه ضعف فکری یا تناقض احتمالی ۱", "نقطه ضعف ۲"],
      "rhetoricalTactics": ["تاکتیک کلامی ۱", "تاکتیک ۲"],
      "historicalContext": "بستر تاریخی و نقل‌قول مرتبط",
      "signaturePhrases": ["تکیه‌کلام ۱", "تکیه‌کلام ۲"]
    },
    "clashPoints": ["نقطه اصطکاک بنیادی ۱", "نقطه اصطکاک ۲", "نقطه اصطکاک ۳"],
    "philosophicalDivergence": "خلاصه تضاد فلسفی دو دیدگاه در یک بند عمیق"
  },
  "personaPrompts": {
    "char1Prompt": "متن پرامپت حرفه‌ای مهندسی شده برای هدایت هوش مصنوعی در نقش طرف اول با جزئیات رفتاری و بیانی",
    "char2Prompt": "متن پرامپت حرفه‌ای مهندسی شده برای هدایت هوش مصنوعی در نقش طرف دوم با جزئیات رفتاری و بیانی",
    "moderatorPrompt": "پرامپت مجری استودیو"
  },
  "turns": [
    {
      "speaker": "moderator" | "char1" | "char2",
      "speakerName": "نام گوینده",
      "text": "متن سخنان گوینده به زبان فارسی بسیار شیوا، طبیعی و دراماتیک (حدود ۲ تا ۴ جمله قوی)",
      "tone": "لحن سخن گفتن (مثلا: تهاجمی و کنایه‌آمیز / آرام و تحلیلی)",
      "rhetoricalMove": "حرکت کلامی در مناظره (مثلا: حمله به ریشه فرض / پرسش سقراطی / مثال نقض)"
    }
  ],
  "verdict": {
    "winner": "char1" | "char2" | "draw",
    "winnerName": "نام برنده یا تساوی",
    "winnerReason": "علت برتری یا تحلیل فنی رقابت",
    "char1Score": { "logic": 90, "eloquence": 85, "rebuttal": 88, "total": 88 },
    "char2Score": { "logic": 88, "eloquence": 92, "rebuttal": 85, "total": 88 },
    "keyTakeaway": "درس بزرگ و جمع‌بندی فکری این مناظره برای شنونده",
    "audienceSentiment": {
      "char1Percentage": 52,
      "char2Percentage": 48,
      "swingFactor": "عامل چرخش افکار عمومی"
    }
  }
}`;

        const prompt = `شخصیت اول: ${char1.persianName || char1.name} (عنوان: ${char1.title}، جنسیت: ${char1.gender}، لحن پیش‌فرض: ${char1.tone}، معرفی: ${char1.bio})
شخصیت دوم: ${char2.persianName || char2.name} (عنوان: ${char2.title}، جنسیت: ${char2.gender}، لحن پیش‌فرض: ${char2.tone}، معرفی: ${char2.bio})
موضوع دقیق مناظره: «${topic}»
تعداد راندهای تبادل نظر: ${rounds} راند رفت و برگشت.
حضور مجری/گرداننده: ${moderator ? 'بله' : 'خیر'}
سبک مناظره: ${debateReq.debateTone || 'پرحرارت، مستدل و عمیق'}

تحقیق را انجام دهید، پرامپت‌های شخصیت را بنویسید و مناظره را کامل همراه با داوری تولید کنید.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);

        // Normalize turns with IDs and numbers
        const turnsWithIds = (parsed.turns || []).map((t: any, idx: number) => ({
          id: `turn-${idx + 1}`,
          turnNumber: idx + 1,
          speaker: t.speaker || (idx % 2 === 0 ? 'char1' : 'char2'),
          speakerName: t.speakerName || (t.speaker === 'char1' ? char1.persianName : char2.persianName),
          text: t.text || '',
          tone: t.tone || 'عادی',
          rhetoricalMove: t.rhetoricalMove || 'بیان دیدگاه',
        }));

        // Pre-generate real Gemini TTS audio for the first turns so audio is instant and genuine
        try {
          await Promise.all(
            turnsWithIds.slice(0, 2).map(async (t: any) => {
              const char =
                t.speaker === 'char1'
                  ? char1
                  : t.speaker === 'char2'
                  ? char2
                  : { voiceName: 'Kore', gender: 'female' };
              const voiceToUse = char.voiceName || (char.gender === 'female' ? 'Kore' : 'Charon');

              const ttsResp = await ai.models.generateContent({
                model: 'gemini-3.8-flash-lite-tts',
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: t.text,
                        speechMetadata: {
                          style: t.tone || (char.gender === 'female' ? 'Clear, passionate female debater' : 'Deep, authoritative male debater'),
                        },
                      },
                    ],
                  },
                ],
                config: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: voiceToUse },
                    },
                  },
                },
              });

              const b64 = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
              if (b64) {
                t.audioBase64 = b64;
              }
            })
          );
        } catch (ttsPreErr: any) {
          console.warn('Pre-generation TTS error in server:', ttsPreErr?.message);
        }

        const result = {
          id: `debate-${Date.now()}`,
          topic,
          roundsCount: rounds,
          character1: char1,
          character2: char2,
          moderatorEnabled: moderator,
          research: parsed.research,
          personaPrompts: parsed.personaPrompts,
          turns: turnsWithIds,
          verdict: parsed.verdict,
          createdAt: new Date().toISOString(),
        };

        return res.json(result);
      } catch (geminiError: any) {
        console.warn('Gemini generateContent error, falling back to deterministic generator:', geminiError?.message);
        const fallbackResult = generateDeterministicDebate(debateReq);
        return res.json(fallbackResult);
      }
    }

    // Fallback if no API key is attached
    const fallbackResult = generateDeterministicDebate(debateReq);
    return res.json(fallbackResult);
  } catch (err: any) {
    console.error('Server error generating debate:', err);
    res.status(500).json({ error: err?.message || 'خطا در ساخت مناظره' });
  }
});

// 2. Synthesize individual speech turn voice using Gemini TTS
app.post('/api/debate/tts', async (req, res) => {
  try {
    const { text, voiceName, gender, tone } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (ai) {
      try {
        // Choose voice: Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
        const selectedVoice = voiceName || (gender === 'female' ? 'Kore' : 'Puck');

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: text,
                  speechMetadata: {
                    style: tone || (gender === 'female' ? 'Articulate, impassioned female debater' : 'Articulate, deep male debater'),
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            audioBase64: base64Audio,
            mimeType: 'audio/wav',
            voiceUsed: selectedVoice,
          });
        }
      } catch (ttsErr: any) {
        console.warn('Gemini TTS error, signaling client to use Web Speech / synthesis fallback:', ttsErr?.message);
      }
    }

    // Fallback response for browser synthesis
    return res.json({
      fallbackSpeech: true,
      message: 'Browser Speech Synthesis fallback',
    });
  } catch (err: any) {
    console.error('TTS endpoint error:', err);
    res.json({ fallbackSpeech: true });
  }
});

// Setup Vite middlewares or static files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[AI Debate Studio] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
