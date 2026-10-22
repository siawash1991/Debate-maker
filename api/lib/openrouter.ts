import { extractJson } from './json.ts';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message);
  }
}

const TEXT_MODEL = 'google/gemini-2.5-flash';

function apiKey(): string {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new ApiError('کلید OpenRouter تنظیم نشده. OPENROUTER_API_KEY را در محیط اجرا بگذار.', 500);
  }
  return key;
}

function textModel(): string {
  return process.env.OPENROUTER_TEXT_MODEL?.trim() || TEXT_MODEL;
}

interface ChatOptions {
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
}

export async function chatJson(options: ChatOptions): Promise<unknown> {
  const first = await chat(options, true).catch(async (error) => {
    if (error instanceof ApiError && error.status === 400) return chat(options, false);
    throw error;
  });

  try {
    return extractJson(first);
  } catch {
    const repair: ChatOptions = {
      ...options,
      temperature: 0,
      user: `The previous answer was not valid JSON. Return only one JSON object, with no markdown.\n\n${first.slice(0, 8000)}`,
    };
    const second = await chat(repair, true).catch(async (error) => {
      if (error instanceof ApiError && error.status === 400) return chat(repair, false);
      throw error;
    });
    return extractJson(second);
  }
}

async function chat(options: ChatOptions, jsonMode: boolean): Promise<string> {
  const body: Record<string, unknown> = {
    model: textModel(),
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    messages: [
      { role: 'system', content: options.system },
      { role: 'user', content: options.user },
    ],
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: openRouterHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55_000),
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new ApiError('مدل در زمان مقرر جواب نداد. یک بار دیگر بزن.', 504);
    }
    throw new ApiError('ارتباط با OpenRouter برقرار نشد.', 502);
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
    choices?: { message?: { content?: unknown } }[];
  } | null;

  if (!response.ok) {
    const message = payload?.error?.message || `OpenRouter ${response.status}`;
    throw new ApiError(message, response.status);
  }

  const text = messageText(payload?.choices?.[0]?.message?.content);
  if (!text) throw new ApiError('مدل پاسخ خالی برگرداند.', 502);
  return text;
}

export async function speech(body: Record<string, unknown>): Promise<{ audioBase64: string; model: string }> {
  const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
    method: 'POST',
    headers: openRouterHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55_000),
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new ApiError('ساخت صدا طول کشید. یک بار دیگر بزن.', 504);
    }
    throw new ApiError('ارتباط با سرویس صدا برقرار نشد.', 502);
  });

  const type = response.headers.get('content-type') || '';
  if (!response.ok || type.includes('application/json') || type.includes('text/')) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new ApiError(payload?.error?.message || `صدای OpenRouter ناموفق بود (${response.status}).`, response.status);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100) throw new ApiError('فایل صدا خالی برگشت.', 502);
  return { audioBase64: bytes.toString('base64'), model: String(body.model) };
}

function openRouterHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey()}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL?.trim() || 'http://localhost:3000',
    'X-Title': 'Debate Studio',
  };
}

function messageText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => (part && typeof part === 'object' && 'text' in part ? String(part.text ?? '') : ''))
    .join('')
    .trim();
}
