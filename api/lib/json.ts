export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const direct = tryParse(trimmed);
  if (direct !== undefined) return direct;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const fenced = tryParse(fence[1].trim());
    if (fenced !== undefined) return fenced;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const sliced = tryParse(trimmed.slice(start, end + 1));
    if (sliced !== undefined) return sliced;
  }

  throw new Error('پاسخ مدل JSON معتبر نبود.');
}

function tryParse(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

export function asStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean).slice(0, limit);
}

export function clampText(value: string, limit: number): string {
  if (value.length <= limit) return value;
  return value.slice(0, limit).trim();
}
