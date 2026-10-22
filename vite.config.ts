import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { handleDebate, handleHealth, handleResearch, handleTts, type RouteRequest } from './api/lib/routes.ts';

const ENV_KEYS = [
  'OPENROUTER_API_KEY',
  'OPENROUTER_TEXT_MODEL',
  'OPENROUTER_TTS_MODEL_FA',
  'OPENROUTER_TTS_MODEL_EN',
  'OPENROUTER_TTS_MODEL_EN_FREE',
  'APP_ACCESS_KEY',
  'APP_URL',
];

function apiPlugin(): Plugin {
  const handlers: Record<string, (request: RouteRequest) => Promise<{ status: number; body: unknown }>> = {
    '/api/health': handleHealth,
    '/api/research': handleResearch,
    '/api/debate': handleDebate,
    '/api/tts': handleTts,
  };

  return {
    name: 'debate-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        const handler = url ? handlers[url] : undefined;
        if (!handler) return next();
        try {
          const header = req.headers['x-access-key'];
          const result = await handler({
            method: req.method,
            body: req.method === 'POST' ? await readBody(req) : undefined,
            accessKey: Array.isArray(header) ? header[0] : header,
          });
          sendJson(res, result.status, result.body);
        } catch {
          sendJson(res, 400, { error: 'بدنه درخواست خوانا نبود.' });
        }
      });
    },
  };
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ENV_KEYS) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
