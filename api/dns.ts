import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resolver } from 'node:dns/promises';

const ALLOWED = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'] as const;
type RecordType = (typeof ALLOWED)[number];

function isValidHost(host: string): boolean {
  if (host.length === 0 || host.length > 253) return false;
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
    host,
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  const host = String(req.query.host ?? '').trim().toLowerCase();
  const type = String(req.query.type ?? 'A').toUpperCase() as RecordType;

  if (!isValidHost(host)) {
    res.status(400).json({ error: 'Invalid hostname' });
    return;
  }
  if (!ALLOWED.includes(type)) {
    res.status(400).json({ error: 'Unsupported record type' });
    return;
  }

  const resolver = new Resolver({ timeout: 5000, tries: 2 });
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  try {
    let records: Array<{ value: string; ttl?: number; priority?: number }> = [];
    if (type === 'A' || type === 'AAAA') {
      const addrs = type === 'A' ? await resolver.resolve4(host) : await resolver.resolve6(host);
      records = addrs.map((a) => ({ value: a }));
    } else if (type === 'MX') {
      const mxs = await resolver.resolveMx(host);
      records = mxs
        .sort((a, b) => a.priority - b.priority)
        .map((m) => ({ value: m.exchange, priority: m.priority }));
    } else if (type === 'TXT') {
      const txts = await resolver.resolveTxt(host);
      records = txts.map((parts) => ({ value: parts.join('') }));
    } else if (type === 'NS') {
      const ns = await resolver.resolveNs(host);
      records = ns.map((n) => ({ value: n }));
    } else if (type === 'CNAME') {
      const cn = await resolver.resolveCname(host);
      records = cn.map((c) => ({ value: c }));
    }

    res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ type, records });
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      res.status(200).json({ type, records: [] });
      return;
    }
    res.status(502).json({ error: err.message ?? 'lookup failed' });
  }
}
