import type { DebateScript, DebateTurn, ResearchDossier } from '../../../shared/types.ts';
import { asString, asStringList, clampText } from '../json.ts';

export function normalizeResearch(raw: unknown, fallbackName: string): ResearchDossier {
  const record = asRecord(raw);
  const dossier: ResearchDossier = {
    name: clampText(asString(record.name, fallbackName), 80) || fallbackName,
    stance: clampText(asString(record.stance), 900),
    coreClaims: asStringList(record.coreClaims, 4).map((item) => clampText(item, 400)),
    evidence: asStringList(record.evidence, 4).map((item) => clampText(item, 400)),
    quotes: asStringList(record.quotes, 4).map((item) => clampText(item, 300)),
    method: clampText(asString(record.method), 500),
    blindSpots: asStringList(record.blindSpots, 4).map((item) => clampText(item, 300)),
    wouldNeverSay: asStringList(record.wouldNeverSay, 4).map((item) => clampText(item, 300)),
    vocabulary: asStringList(record.vocabulary, 4).map((item) => clampText(item, 120)),
    pressurePoints: asStringList(record.pressurePoints, 4).map((item) => clampText(item, 300)),
  };

  if (dossier.stance.length < 20 || dossier.coreClaims.length < 2 || dossier.pressurePoints.length < 1 || dossier.method.length < 8) {
    throw new Error('پرونده تحقیق ناقص برگشت. یک بار دیگر بساز.');
  }
  return dossier;
}

export function normalizeDebate(
  raw: unknown,
  rounds: number,
  nameA: string,
  nameB: string,
): DebateScript {
  const record = asRecord(raw);
  const expected = rounds * 2;
  const items = Array.isArray(record.turns) ? record.turns : [];
  const turns: DebateTurn[] = [];

  for (const item of items) {
    const turn = asRecord(item);
    const speaker = mapSpeaker(turn.speaker, nameA, nameB);
    const text = clampText(asString(turn.text), 1800);
    if (!speaker || text.length < 40) continue;
    turns.push({
      id: `t${turns.length + 1}`,
      speaker,
      speakerName: speaker === 'a' ? nameA : nameB,
      text,
      move: clampText(asString(turn.move, 'answers the previous claim'), 240),
      delivery: clampText(asString(turn.delivery, 'clear, conversational'), 160),
    });
    if (turns.length === expected) break;
  }

  if (turns.length !== expected) {
    throw new Error('مناظره با تعداد نوبت درست برنگشت. یک بار دیگر بنویس.');
  }
  for (let index = 0; index < turns.length; index += 1) {
    const wanted = index % 2 === 0 ? 'a' : 'b';
    if (turns[index].speaker !== wanted) {
      throw new Error('نوبت‌ها به نوبت بین دو طرف عوض نشدند. یک بار دیگر بنویس.');
    }
  }

  return {
    premise: clampText(asString(record.premise), 400),
    turns,
  };
}

function mapSpeaker(value: unknown, nameA: string, nameB: string): 'a' | 'b' | null {
  const text = asString(value).toLowerCase();
  if (!text) return null;
  if (['a', 'speaker a', 'char1', 'first', '1'].includes(text)) return 'a';
  if (['b', 'speaker b', 'char2', 'second', '2'].includes(text)) return 'b';
  const a = nameA.trim().toLowerCase();
  const b = nameB.trim().toLowerCase();
  const mentionsA = a.length > 1 && text.includes(a);
  const mentionsB = b.length > 1 && text.includes(b);
  if (mentionsA && !mentionsB) return 'a';
  if (mentionsB && !mentionsA) return 'b';
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}
