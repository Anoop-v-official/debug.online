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

// Search analytics (empty/no-result queries)
const KEY_SEARCH_MISS = 'stats:searchMiss';

// Tool requests / feedback
const KEY_REQUESTS = 'stats:requests';
const REQUEST_MAX_LEN = 500;

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

async function handleSearchMiss(query: string, res: VercelResponse) {
  const normalized = query.trim().toLowerCase().slice(0, 60);
  if (!normalized) {
    res.status(400).json({ error: 'empty query' });
    return;
  }
  if (KV_URL && KV_TOKEN) {
    try {
      await kvPipeline([['ZINCRBY', KEY_SEARCH_MISS, 1, normalized]]);
      res.status(200).json({ ok: true });
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('metrics search-miss kv error', e);
    }
  }
  res.status(200).json({ ok: true });
}

async function handleRequest(
  body: { text?: unknown; email?: unknown },
  res: VercelResponse,
) {
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, REQUEST_MAX_LEN) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  if (!text) {
    res.status(400).json({ error: 'text required' });
    return;
  }
  const entry = JSON.stringify({ text, email, at: Date.now() });
  if (KV_URL && KV_TOKEN) {
    try {
      // Store as a list, capped at the last 500 entries to bound storage.
      await kvPipeline([
        ['LPUSH', KEY_REQUESTS, entry],
        ['LTRIM', KEY_REQUESTS, 0, 499],
      ]);
      res.status(200).json({ ok: true });
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('metrics request kv error', e);
    }
  }
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
    const body = (req.body ?? {}) as Record<string, unknown>;
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

    if (kind === 'search-miss') {
      const query = typeof (body as { query?: unknown }).query === 'string'
        ? ((body as { query: string }).query)
        : '';
      await handleSearchMiss(query, res);
      return;
    }

    if (kind === 'request') {
      await handleRequest(body as { text?: unknown; email?: unknown }, res);
      return;
    }

    res.status(400).json({ error: 'kind must be "presence", "track", "search-miss" or "request"' });
    return;
  }

  if (req.method === 'GET') {
    const kind = String(req.query.kind ?? 'tools');

    if (kind === 'tools') {
      const limit = Math.min(
        Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1),
        100,
      );
      await handleToolsGet(limit, res);
      return;
    }

    if (kind === 'overview') {
      await handleOverviewGet(res);
      return;
    }

    res.status(400).json({ error: 'kind must be "tools" or "overview"' });
    return;
  }

  res.status(405).json({ error: 'GET or POST only' });
}

async function handleOverviewGet(res: VercelResponse) {
  const now = Date.now();
  const cutoff = now - STALE_MS;

  if (KV_URL && KV_TOKEN) {
    try {
      const out = await kvPipeline([
        ['ZREMRANGEBYSCORE', ONLINE_KEY, 0, cutoff],
        ['ZCARD', ONLINE_KEY],
        ['GET', TOTAL_KEY],
        ['ZCARD', KEY_TOOLS],
        ['ZREVRANGE', KEY_TOOLS, 0, 0, 'WITHSCORES'],
      ]);
      const liveUsers = Number(out?.[1]?.result ?? 0) || 0;
      const totalVisits = Number(out?.[2]?.result ?? 0) || 0;
      const distinctTools = Number(out?.[3]?.result ?? 0) || 0;
      const topRaw = (out?.[4]?.result ?? []) as unknown[];
      const topTool = topRaw.length >= 2 ? String(topRaw[0]) : null;
      const topToolCount = topRaw.length >= 2 ? Number(topRaw[1]) || 0 : 0;
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
      res.status(200).json({
        liveUsers,
        totalVisits,
        distinctTools,
        topTool,
        topToolCount,
      });
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('metrics overview kv read error', e);
    }
  }

  pruneMem(now);
  let topTool: string | null = null;
  let topToolCount = 0;
  for (const [slug, count] of memCounts) {
    if (count > topToolCount) {
      topTool = slug;
      topToolCount = count;
    }
  }
  res.status(200).json({
    liveUsers: memOnline.size,
    totalVisits: memTotal,
    distinctTools: memCounts.size,
    topTool,
    topToolCount,
  });
}
