import type { VercelRequest, VercelResponse } from '@vercel/node';
import tls from 'node:tls';

function isValidHost(host: string): boolean {
  if (host.length === 0 || host.length > 253) return false;
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
    host,
  );
}

interface CertJSON {
  subject?: { CN?: string };
  issuer?: { CN?: string; O?: string };
  valid_from: string;
  valid_to: string;
  subjectaltname?: string;
}

function summarizeName(o?: { CN?: string; O?: string }): string {
  if (!o) return '';
  if (o.CN) return o.CN;
  if (o.O) return o.O;
  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  const host = String(req.query.host ?? '').trim().toLowerCase();
  if (!isValidHost(host)) {
    res.status(400).json({ error: 'Invalid hostname' });
    return;
  }

  try {
    const result = await new Promise<CertJSON & { protocol?: string }>((resolve, reject) => {
      const socket = tls.connect(
        {
          host,
          port: 443,
          servername: host,
          timeout: 6000,
          rejectUnauthorized: false,
        },
        () => {
          const cert = socket.getPeerCertificate(false) as unknown as CertJSON;
          const protocol = socket.getProtocol() ?? undefined;
          socket.end();
          if (!cert || !cert.valid_to) {
            reject(new Error('No certificate returned'));
            return;
          }
          resolve({ ...cert, protocol });
        },
      );
      socket.on('timeout', () => {
        socket.destroy(new Error('TLS handshake timed out'));
      });
      socket.on('error', reject);
    });

    const validTo = new Date(result.valid_to);
    const daysRemaining = Math.floor(
      (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    const altNames = (result.subjectaltname ?? '')
      .split(',')
      .map((p) => p.trim().replace(/^DNS:/i, ''))
      .filter(Boolean);

    res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=600');
    res.status(200).json({
      subject: summarizeName(result.subject),
      issuer: summarizeName(result.issuer),
      validFrom: result.valid_from,
      validTo: result.valid_to,
      daysRemaining,
      altNames,
      protocol: result.protocol,
    });
  } catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : 'TLS connection failed',
    });
  }
}
