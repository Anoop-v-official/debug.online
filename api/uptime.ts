import type { VercelRequest, VercelResponse } from '@vercel/node';

function isValidUrl(s: string): URL | null {
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  const raw = String(req.query.url ?? '').trim();
  const target = isValidUrl(raw);
  if (!target) {
    res.status(400).json({ error: 'Invalid http(s) URL' });
    return;
  }

  const redirects: Array<{ url: string; status: number }> = [];
  let current = target.toString();
  let final: { url: string; status: number; statusText: string } | null = null;
  const start = Date.now();
  const limit = 5;

  try {
    for (let i = 0; i < limit; i++) {
      const r = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'debugdaily.online' },
      });
      redirects.push({ url: current, status: r.status });
      const loc = r.headers.get('location');
      if (r.status >= 300 && r.status < 400 && loc) {
        const next = new URL(loc, current).toString();
        current = next;
        continue;
      }
      final = { url: r.url || current, status: r.status, statusText: r.statusText };
      break;
    }
    if (!final) {
      res.status(502).json({ error: `Too many redirects (>${limit})` });
      return;
    }
    const totalMs = Date.now() - start;

    res.setHeader('cache-control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).json({
      url: target.toString(),
      finalUrl: final.url,
      status: final.status,
      statusText: final.statusText,
      ok: final.status >= 200 && final.status < 400,
      redirects,
      totalMs,
    });
  } catch (e) {
    res.status(200).json({
      url: target.toString(),
      finalUrl: current,
      status: 0,
      statusText: 'unreachable',
      ok: false,
      redirects,
      totalMs: Date.now() - start,
      error: e instanceof Error ? e.message : 'fetch failed',
    });
  }
}
