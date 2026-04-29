import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RdapEvent {
  eventAction: string;
  eventDate: string;
}

interface RdapEntity {
  roles?: string[];
  vcardArray?: unknown[];
}

interface RdapResponse {
  ldhName?: string;
  handle?: string;
  status?: string[];
  events?: RdapEvent[];
  entities?: RdapEntity[];
  nameservers?: Array<{ ldhName: string }>;
  errorCode?: number;
  title?: string;
  description?: string[];
}

function isValidDomain(host: string): boolean {
  if (host.length === 0 || host.length > 253) return false;
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
    host,
  );
}

function vcardName(v: unknown[] | undefined): string | undefined {
  if (!Array.isArray(v) || v.length < 2) return undefined;
  const fields = v[1] as unknown[];
  if (!Array.isArray(fields)) return undefined;
  for (const f of fields) {
    if (Array.isArray(f) && f[0] === 'fn' && typeof f[3] === 'string') return f[3];
    if (Array.isArray(f) && f[0] === 'org' && typeof f[3] === 'string') return f[3];
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  const domain = String(req.query.domain ?? '').trim().toLowerCase();
  if (!isValidDomain(domain)) {
    res.status(400).json({ error: 'Invalid domain name' });
    return;
  }

  try {
    const r = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { 'User-Agent': 'debugdaily.online', accept: 'application/rdap+json' },
      redirect: 'follow',
    });
    if (r.status === 404) {
      res.status(404).json({ error: 'Domain not found' });
      return;
    }
    if (!r.ok) {
      res.status(502).json({ error: `Upstream HTTP ${r.status}` });
      return;
    }
    const body = (await r.json()) as RdapResponse;

    const events = body.events ?? [];
    const event = (action: string) => events.find((e) => e.eventAction === action)?.eventDate;

    const entities = body.entities ?? [];
    const registrar = entities.find((e) => e.roles?.includes('registrar'));
    const registrant = entities.find((e) => e.roles?.includes('registrant'));

    res.setHeader('cache-control', 's-maxage=900, stale-while-revalidate=3600');
    res.status(200).json({
      domain: body.ldhName ?? domain,
      handle: body.handle,
      status: body.status ?? [],
      registered: event('registration'),
      changed: event('last changed'),
      expires: event('expiration'),
      registrar: vcardName(registrar?.vcardArray),
      registrant: vcardName(registrant?.vcardArray),
      nameservers: (body.nameservers ?? []).map((n) => n.ldhName.toLowerCase()),
    });
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'whois failed' });
  }
}
