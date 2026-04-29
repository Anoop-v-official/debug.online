import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SecurityCheck {
  header: string;
  present: boolean;
  value?: string;
  good: boolean;
  hint: string;
}

const SECURITY_HEADERS: Array<{
  name: string;
  hint: string;
  goodIf: (v: string) => boolean;
}> = [
  {
    name: 'strict-transport-security',
    hint: 'HSTS forces HTTPS and prevents downgrade attacks.',
    goodIf: (v) => /max-age=\d+/i.test(v) && parseInt(v.match(/max-age=(\d+)/i)?.[1] ?? '0', 10) >= 15768000,
  },
  {
    name: 'content-security-policy',
    hint: 'CSP limits where the page can load resources from.',
    goodIf: (v) => v.length > 0 && !/unsafe-inline/i.test(v),
  },
  {
    name: 'x-frame-options',
    hint: 'Prevents clickjacking via frames.',
    goodIf: (v) => /^(DENY|SAMEORIGIN)$/i.test(v.trim()),
  },
  {
    name: 'x-content-type-options',
    hint: 'Stops MIME-type sniffing.',
    goodIf: (v) => v.trim().toLowerCase() === 'nosniff',
  },
  {
    name: 'referrer-policy',
    hint: 'Controls how much referrer info is sent.',
    goodIf: (v) => v.length > 0 && !/unsafe-url/i.test(v),
  },
  {
    name: 'permissions-policy',
    hint: 'Restricts powerful APIs (camera, mic, geo).',
    goodIf: (v) => v.length > 0,
  },
];

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

  try {
    const r = await fetch(target.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'debugdaily.online' },
    });
    const headers: Record<string, string> = {};
    r.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });

    const checks: SecurityCheck[] = SECURITY_HEADERS.map((h) => {
      const value = headers[h.name];
      const present = value !== undefined;
      return {
        header: h.name,
        present,
        value,
        good: present && h.goodIf(value!),
        hint: h.hint,
      };
    });

    const score = Math.round((checks.filter((c) => c.good).length / checks.length) * 100);

    res.setHeader('cache-control', 's-maxage=120, stale-while-revalidate=600');
    res.status(200).json({
      url: target.toString(),
      finalUrl: r.url,
      status: r.status,
      statusText: r.statusText,
      headers,
      checks,
      securityScore: score,
    });
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'fetch failed' });
  }
}
