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

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function findMeta(html: string, predicate: (attrs: Record<string, string>) => boolean): string | undefined {
  const re = /<meta\s+([^>]+?)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[1]);
    if (predicate(attrs)) return attrs.content ? decode(attrs.content) : undefined;
  }
  return undefined;
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    out[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? '').trim();
  }
  return out;
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

  try {
    const r = await fetch(target.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'debugdaily.online (link-preview)' },
    });
    if (!r.ok) {
      res.status(502).json({ error: `Upstream HTTP ${r.status}` });
      return;
    }
    let html = await r.text();
    if (html.length > 500_000) html = html.slice(0, 500_000);

    const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
    const title = titleMatch ? decode(titleMatch[1].trim()) : undefined;
    const description = findMeta(html, (a) => a.name === 'description');

    const og = (k: string) =>
      findMeta(html, (a) => a.property === `og:${k}`);
    const tw = (k: string) =>
      findMeta(html, (a) => a.name === `twitter:${k}`);

    const ogImage = og('image');
    const twImage = tw('image') ?? og('image');
    const ogUrl = og('url');

    res.setHeader('cache-control', 's-maxage=900, stale-while-revalidate=3600');
    res.status(200).json({
      url: target.toString(),
      finalUrl: r.url,
      title,
      description,
      og: {
        title: og('title') ?? title,
        description: og('description') ?? description,
        image: ogImage,
        url: ogUrl ?? r.url,
        siteName: og('site_name'),
        type: og('type'),
      },
      twitter: {
        card: tw('card'),
        title: tw('title') ?? title,
        description: tw('description') ?? description,
        image: twImage,
      },
      canonical: (() => {
        const m = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html);
        return m ? m[1] : undefined;
      })(),
    });
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'fetch failed' });
  }
}
