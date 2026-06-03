import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const KEY_ALL = 'stats:tools';

// In-process fallback for local dev / when KV isn't configured.
// Serverless instances do not share this map, so prod needs KV for an
// accurate aggregate.
const memCounts = new Map<string, number>();

const SLUG_RE = /^[a-z0-9-]{2,64}$/;

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

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as { slug?: unknown };
    const slug = typeof body.slug === 'string' ? body.slug : '';
    if (!SLUG_RE.test(slug)) {
      res.status(400).json({ error: 'invalid slug' });
      return;
    }

    if (KV_URL && KV_TOKEN) {
      try {
        await kvPipeline([['ZINCRBY', KEY_ALL, 1, slug]]);
        res.status(200).json({ ok: true });
        return;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('track kv error', e);
      }
    }

    memCounts.set(slug, (memCounts.get(slug) ?? 0) + 1);
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'GET') {
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1),
      100,
    );

    if (KV_URL && KV_TOKEN) {
      try {
        const out = await kvPipeline([
          ['ZREVRANGE', KEY_ALL, 0, limit - 1, 'WITHSCORES'],
          ['ZCARD', KEY_ALL],
        ]);
        const rawList = (out?.[0]?.result ?? []) as unknown[];
        const totalTools = Number(out?.[1]?.result ?? 0) || 0;
        // Upstash returns [member, score, member, score, ...].
        const tools: Array<{ slug: string; count: number }> = [];
        let totalCount = 0;
        for (let i = 0; i + 1 < rawList.length; i += 2) {
          const slug = String(rawList[i]);
          const count = Number(rawList[i + 1]) || 0;
          tools.push({ slug, count });
          totalCount += count;
        }
        // Also pull the total across the whole sorted set for an honest "all
        // opens" figure (separate small call to ZRANGE 0 -1 WITHSCORES would
        // be wasteful; we trust the top N to approximate the whole when limit
        // covers most tools).
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.status(200).json({ tools, totalCount, totalTools });
        return;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('track kv read error', e);
      }
    }

    const tools = [...memCounts.entries()]
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    const totalCount = tools.reduce((s, t) => s + t.count, 0);
    res.status(200).json({ tools, totalCount, totalTools: memCounts.size });
    return;
  }

  res.status(405).json({ error: 'GET or POST only' });
}
