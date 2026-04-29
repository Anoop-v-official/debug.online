import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resolver } from 'node:dns/promises';

const DNSBLS = [
  'zen.spamhaus.org',
  'b.barracudacentral.org',
  'bl.spamcop.net',
  'cbl.abuseat.org',
  'dnsbl.sorbs.net',
  'spam.dnsbl.sorbs.net',
  'bl.deadbeef.com',
  'psbl.surriel.com',
  'rbl.efnetrbl.org',
  'truncate.gbudb.net',
  'ubl.unsubscore.com',
  'ix.dnsbl.manitu.net',
];

function reverseV4(ip: string): string | null {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return null;
  const parts = ip.split('.');
  if (parts.some((p) => Number(p) < 0 || Number(p) > 255)) return null;
  return parts.reverse().join('.');
}

interface CheckResult {
  list: string;
  listed: boolean;
  response?: string;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  const ip = String(req.query.ip ?? '').trim();
  const reversed = reverseV4(ip);
  if (!reversed) {
    res.status(400).json({ error: 'Provide a valid IPv4 address' });
    return;
  }

  const resolver = new Resolver({ timeout: 3000, tries: 1 });
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  const checks: CheckResult[] = await Promise.all(
    DNSBLS.map(async (list) => {
      try {
        const records = await resolver.resolve4(`${reversed}.${list}`);
        return { list, listed: records.length > 0, response: records[0] };
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
          return { list, listed: false };
        }
        return { list, listed: false, error: err.message ?? 'lookup failed' };
      }
    }),
  );

  const listedOn = checks.filter((c) => c.listed);

  res.setHeader('cache-control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).json({
    ip,
    totalChecked: DNSBLS.length,
    listedCount: listedOn.length,
    clean: listedOn.length === 0,
    checks,
  });
}
