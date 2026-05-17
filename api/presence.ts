import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const KEY = 'presence:online';
const STALE_MS = 60_000; // a session is considered active if heard from in last 60s

// In-process fallback for local dev / when KV isn't configured.
// Serverless instances don't share this, so prod must use KV.
const memory = new Map<string, number>();

function pruneMemory(now: number) {
  for (const [sid, last] of memory) {
    if (now - last > STALE_MS) memory.delete(sid);
  }
}

async function kvPipeline(commands: Array<Array<string | number>>): Promise<unknown[] | null> {
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
  const body = (await res.json()) as Array<{ result?: unknown; error?: string }>;
  return body.map((entry) => entry.result);
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
      const results = await kvPipeline([
        ['ZREMRANGEBYSCORE', KEY, 0, cutoff],
        ['ZADD', KEY, now, sid],
        ['EXPIRE', KEY, 120],
        ['ZCARD', KEY],
      ]);
      const count = Number((results && results[3]) ?? 0) || 0;
      res.status(200).json({ count });
      return;
    } catch (e) {
      // Fall through to memory if KV blips, so the badge degrades gracefully.
      // eslint-disable-next-line no-console
      console.error('presence kv error', e);
    }
  }

  pruneMemory(now);
  memory.set(sid, now);
  res.status(200).json({ count: memory.size });
}
