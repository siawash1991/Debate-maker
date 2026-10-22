import type { DebateRequest, ResearchRequest, TtsRequest } from '../../shared/types.ts';
import { validateDebateRequest, validateResearchRequest, validateTtsRequest } from '../../shared/validate.ts';
import { accessOk, accessRequired } from './access.ts';
import { runDebateAgent } from './agents/debate.ts';
import { runResearchAgent } from './agents/research.ts';
import { ApiError } from './openrouter.ts';
import { synthesize } from './tts.ts';

export interface RouteRequest {
  method?: string;
  body?: unknown;
  accessKey?: string;
}

export interface RouteResult {
  status: number;
  body: unknown;
}

export async function handleHealth(request: RouteRequest): Promise<RouteResult> {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed' } };
  }
  if (accessRequired() && !accessOk(request.accessKey)) {
    return { status: 401, body: { needsAccessKey: true, error: 'کلید دسترسی لازم است.' } };
  }
  return { status: 200, body: { ok: true, needsAccessKey: accessRequired() } };
}

export async function handleResearch(request: RouteRequest): Promise<RouteResult> {
  const denied = guard(request);
  if (denied) return denied;
  const input = request.body as Partial<ResearchRequest>;
  const validation = validateResearchRequest(input);
  if (!validation.ok) return { status: 400, body: { error: validation.error } };
  return run(() => runResearchAgent(input as ResearchRequest));
}

export async function handleDebate(request: RouteRequest): Promise<RouteResult> {
  const denied = guard(request);
  if (denied) return denied;
  const input = request.body as Partial<DebateRequest>;
  const validation = validateDebateRequest(input);
  if (!validation.ok) return { status: 400, body: { error: validation.error } };
  return run(() => runDebateAgent(input as DebateRequest));
}

export async function handleTts(request: RouteRequest): Promise<RouteResult> {
  const denied = guard(request);
  if (denied) return denied;
  const input = request.body as Partial<TtsRequest>;
  const validation = validateTtsRequest(input);
  if (!validation.ok) return { status: 400, body: { error: validation.error } };
  return run(() => synthesize(input as TtsRequest));
}

function guard(request: RouteRequest): RouteResult | null {
  if (request.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };
  if (!accessOk(request.accessKey)) {
    return { status: 401, body: { needsAccessKey: true, error: 'کلید دسترسی نادرست است.' } };
  }
  return null;
}

async function run(work: () => Promise<unknown>): Promise<RouteResult> {
  try {
    return { status: 200, body: await work() };
  } catch (error) {
    if (error instanceof ApiError) return { status: error.status, body: { error: error.message } };
    const message = error instanceof Error ? error.message : 'خطای سرور';
    return { status: 500, body: { error: message } };
  }
}
