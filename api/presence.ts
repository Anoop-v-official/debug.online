import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const ONLINE_KEY = 'presence:online';
const TOTAL_KEY = 'stats:totalVisits';
const STALE_MS = 60_000; // session active if heard from in last 60s
const VISIT_DEDUPE_S = 86_400; // each sid only counts once per 24h toward total

// In-process fallback for local dev / when KV isn't configured.
// Serverless instances don't share this, so prod must use KV for an accurate count.
const memOnline = new Map<string, number>();
const memSeen = new Map<string, number>(); // sid -> expiry ms
let memTotal = 0;

function pruneMem(now: number) {
  for (const [sid, last] of memOnline) {
    if (now - last > STALE_MS) memOnline.delete(sid);
  }
  for (const [sid, exp] of memSeen) {
    if (exp < now) memSeen.delete(sid);
  }
}

async function kvPipeline(
  commands: Array<Array<string | number>>,
): Promise<Array<{ result?: unknown; error?: string }> | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${KV_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`KV pipeline failed: ${res.status}`);
  return (await res.json()) as Array<{ result?: unknown; error?: string }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const body = (req.body ?? {}) as { sid?: unknown };
  const sid = typeof body.sid === 'string' ? body.sid : '';
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(sid)) {
    res.status(400).json({ error: 'invalid sid' });
    return;
  }

  const now = Date.now();
  const cutoff = now - STALE_MS;

  if (KV_URL && KV_TOKEN) {
    try {
      const r1 = await kvPipeline([
        ['SET', `visit:${sid}`, '1', 'EX', VISIT_DEDUPE_S, 'NX'],
        ['ZREMRANGEBYSCORE', ONLINE_KEY, 0, cutoff],
        ['ZADD', ONLINE_KEY, now, sid],
        ['EXPIRE', ONLINE_KEY, 120],
        ['ZCARD', ONLINE_KEY],
        ['GET', TOTAL_KEY],
      ]);
      // Upstash returns "OK" for a successful SET NX, null when the key already exists.
      const isNewVisit = r1?.[0]?.result === 'OK';
      const count = Number(r1?.[4]?.result ?? 0) || 0;
      let total = Number(r1?.[5]?.result ?? 0) || 0;

      if (isNewVisit) {
        const r2 = await kvPipeline([['INCR', TOTAL_KEY]]);
        total = Number(r2?.[0]?.result ?? total + 1) || total + 1;
      }

      res.status(200).json({ count, total });
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('presence kv error', e);
      // Fall through to memory so the badge degrades gracefully.
    }
  }

  pruneMem(now);
  if (!memSeen.has(sid)) {
    memSeen.set(sid, now + VISIT_DEDUPE_S * 1000);
    memTotal += 1;
  }
  memOnline.set(sid, now);
  res.status(200).json({ count: memOnline.size, total: memTotal });
}
