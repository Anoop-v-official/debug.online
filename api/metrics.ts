import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// Presence (active users + total visits)
const ONLINE_KEY = 'presence:online';
const TOTAL_KEY = 'stats:totalVisits';
const STALE_MS = 60_000;
const VISIT_DEDUPE_S = 86_400;

// Tool tracking
const KEY_TOOLS = 'stats:tools';
const SLUG_RE = /^[a-z0-9-]{2,64}$/;
const SID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// In-process fallback for local dev / when KV isn't configured.
const memOnline = new Map<string, number>();
const memSeen = new Map<string, number>();
let memTotal = 0;
const memCounts = new Map<string, number>();

function pruneMem(now: number) {
  for (const [sid, last] of memOnline) if (now - last > STALE_MS) memOnline.delete(sid);
  for (const [sid, exp] of memSeen) if (exp < now) memSeen.delete(sid);
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

async function handlePresence(sid: string, res: VercelResponse) {
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
      console.error('metrics presence kv error', e);
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

async function handleTrackPost(slug: string, res: VercelResponse) {
  if (KV_URL && KV_TOKEN) {
    try {
      await kvPipeline([['ZINCRBY', KEY_TOOLS, 1, slug]]);
      res.status(200).json({ ok: true });
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('metrics track kv error', e);
    }
  }
  memCounts.set(slug, (memCounts.get(slug) ?? 0) + 1);
  res.status(200).json({ ok: true });
}

async function handleToolsGet(limit: number, res: VercelResponse) {
  if (KV_URL && KV_TOKEN) {
    try {
      const out = await kvPipeline([
        ['ZREVRANGE', KEY_TOOLS, 0, limit - 1, 'WITHSCORES'],
        ['ZCARD', KEY_TOOLS],
      ]);
      const rawList = (out?.[0]?.result ?? []) as unknown[];
      const totalTools = Number(out?.[1]?.result ?? 0) || 0;
      const tools: Array<{ slug: string; count: number }> = [];
      let totalCount = 0;
      for (let i = 0; i + 1 < rawList.length; i += 2) {
        const slug = String(rawList[i]);
        const count = Number(rawList[i + 1]) || 0;
        tools.push({ slug, count });
        totalCount += count;
      }
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
      res.status(200).json({ tools, totalCount, totalTools });
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('metrics tools kv read error', e);
    }
  }

  const tools = [...memCounts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  const totalCount = tools.reduce((s, t) => s + t.count, 0);
  res.status(200).json({ tools, totalCount, totalTools: memCounts.size });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as { kind?: unknown; sid?: unknown; slug?: unknown };
    const kind = typeof body.kind === 'string' ? body.kind : '';

    if (kind === 'presence') {
      const sid = typeof body.sid === 'string' ? body.sid : '';
      if (!SID_RE.test(sid)) {
        res.status(400).json({ error: 'invalid sid' });
        return;
      }
      await handlePresence(sid, res);
      return;
    }

    if (kind === 'track') {
      const slug = typeof body.slug === 'string' ? body.slug : '';
      if (!SLUG_RE.test(slug)) {
        res.status(400).json({ error: 'invalid slug' });
        return;
      }
      await handleTrackPost(slug, res);
      return;
    }

    res.status(400).json({ error: 'kind must be "presence" or "track"' });
    return;
  }

  if (req.method === 'GET') {
    const kind = String(req.query.kind ?? 'tools');
    if (kind !== 'tools') {
      res.status(400).json({ error: 'kind must be "tools"' });
      return;
    }
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1),
      100,
    );
    await handleToolsGet(limit, res);
    return;
  }

  res.status(405).json({ error: 'GET or POST only' });
}
