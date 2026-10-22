import type { RouteRequest, RouteResult } from './routes.ts';

export function readRequest(req: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}): RouteRequest {
  const raw = req.headers?.['x-access-key'] ?? req.headers?.['X-Access-Key'];
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return {
    method: req.method,
    body,
    accessKey: Array.isArray(raw) ? raw[0] : raw,
  };
}

export function send(res: { status: (code: number) => { json: (body: unknown) => void } }, result: RouteResult): void {
  res.status(result.status).json(result.body);
}
