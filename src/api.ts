import type { DebateRequest, DebateScript, ResearchDossier, ResearchRequest, TtsRequest } from '../shared/types';

const ACCESS_STORAGE = 'debate-access-key';

let accessKey = readStoredAccessKey();

export class AccessError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function setAccessKey(value: string): void {
  accessKey = value.trim();
  sessionStorage.setItem(ACCESS_STORAGE, accessKey);
}

export async function checkHealth(): Promise<{ ok: boolean; needsAccessKey: boolean }> {
  const data = await request<{ ok?: boolean; needsAccessKey?: boolean }>('/api/health', undefined, 'GET');
  return { ok: Boolean(data.ok), needsAccessKey: Boolean(data.needsAccessKey) };
}

export function researchDebater(input: ResearchRequest): Promise<ResearchDossier> {
  return request<ResearchDossier>('/api/research', input);
}

export function writeDebate(input: DebateRequest): Promise<DebateScript> {
  return request<DebateScript>('/api/debate', input);
}

export function synthesizeTurn(input: TtsRequest): Promise<{ audioBase64: string; model: string }> {
  return request('/api/tts', input);
}

async function request<T>(path: string, body: unknown, method: 'GET' | 'POST' = 'POST'): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== 'GET') headers['Content-Type'] = 'application/json';
  if (accessKey) headers['x-access-key'] = accessKey;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد.');
  }

  const data = (await response.json().catch(() => ({}))) as T & { error?: string; needsAccessKey?: boolean };
  if (response.status === 401 && data.needsAccessKey) {
    throw new AccessError(data.error || 'کلید دسترسی لازم است.');
  }
  if (!response.ok) throw new Error(data.error || 'درخواست ناموفق بود.');
  return data;
}

function readStoredAccessKey(): string {
  try {
    return sessionStorage.getItem(ACCESS_STORAGE)?.trim() || '';
  } catch {
    return '';
  }
}
