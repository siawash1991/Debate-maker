import { timingSafeEqual } from 'node:crypto';

export function accessRequired(): boolean {
  return Boolean(process.env.APP_ACCESS_KEY?.trim());
}

export function accessOk(provided: string | undefined): boolean {
  const expected = process.env.APP_ACCESS_KEY?.trim();
  if (!expected) return true;
  if (!provided) return false;
  const actual = Buffer.from(provided);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length) return false;
  return timingSafeEqual(actual, wanted);
}
