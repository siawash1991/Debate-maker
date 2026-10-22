import { handleDebate } from './lib/routes.ts';
import { readRequest, send } from './lib/vercel.ts';

export const maxDuration = 60;

export default async function handler(req: Parameters<typeof readRequest>[0], res: Parameters<typeof send>[0]) {
  send(res, await handleDebate(readRequest(req)));
}
