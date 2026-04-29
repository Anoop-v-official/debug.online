import type { VercelRequest, VercelResponse } from '@vercel/node';

interface IpApiResponse {
  status: string;
  message?: string;
  query: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

const FIELDS =
  'status,message,query,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting';

function clientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim();
  return first || (req.headers['x-real-ip'] as string) || '';
}

function isValidIp(ip: string): boolean {
  if (!ip) return false;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split('.').every((p) => {
      const n = Number(p);
      return n >= 0 && n <= 255;
    });
  }
  // Loose IPv6 check
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }

  const queried = String(req.query.ip ?? '').trim();
  let target = queried || clientIp(req);
  if (target && !isValidIp(target)) {
    res.status(400).json({ error: 'Invalid IP address' });
    return;
  }
  if (!target) target = ''; // ip-api auto-detects when target is empty

  try {
    const r = await fetch(`http://ip-api.com/json/${target}?fields=${FIELDS}`, {
      headers: { 'User-Agent': 'debugdaily.online' },
    });
    if (!r.ok) {
      res.status(502).json({ error: `Upstream HTTP ${r.status}` });
      return;
    }
    const body = (await r.json()) as IpApiResponse;
    if (body.status !== 'success') {
      res.status(400).json({ error: body.message ?? 'lookup failed' });
      return;
    }
    res.setHeader('cache-control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({
      ip: body.query,
      country: body.country,
      countryCode: body.countryCode,
      region: body.regionName,
      regionCode: body.region,
      city: body.city,
      zip: body.zip,
      lat: body.lat,
      lon: body.lon,
      timezone: body.timezone,
      isp: body.isp,
      org: body.org,
      asn: body.as,
      reverse: body.reverse,
      mobile: !!body.mobile,
      proxy: !!body.proxy,
      hosting: !!body.hosting,
    });
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : 'lookup failed' });
  }
}
