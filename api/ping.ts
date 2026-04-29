import type { VercelRequest, VercelResponse } from '@vercel/node';
import net from 'node:net';

function isValidHost(host: string): boolean {
  if (host.length === 0 || host.length > 253) return false;
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
    host,
  );
}

function tcpProbe(host: string, port: number, timeoutMs: number): Promise<{ ok: boolean; ms: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let settled = false;
    const finish = (result: { ok: boolean; ms: number; error?: string }) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish({ ok: true, ms: Date.now() - start }));
    socket.once('timeout', () => finish({ ok: false, ms: timeoutMs, error: 'timeout' }));
    socket.once('error', (e) => finish({ ok: false, ms: Date.now() - start, error: e.message }));
    socket.connect(port, host);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' });
    return;
  }
  const host = String(req.query.host ?? '').trim().toLowerCase();
  const port = Math.max(1, Math.min(65535, Number(req.query.port ?? '443') || 443));
  const samples = Math.max(1, Math.min(10, Number(req.query.samples ?? '4') || 4));

  if (!isValidHost(host)) {
    res.status(400).json({ error: 'Invalid hostname' });
    return;
  }

  const probes: Array<{ ok: boolean; ms: number; error?: string }> = [];
  for (let i = 0; i < samples; i++) {
    probes.push(await tcpProbe(host, port, 5000));
  }

  const ok = probes.filter((p) => p.ok);
  const stats =
    ok.length === 0
      ? { min: 0, max: 0, avg: 0, lossPct: 100 }
      : {
          min: Math.min(...ok.map((p) => p.ms)),
          max: Math.max(...ok.map((p) => p.ms)),
          avg: Math.round(ok.reduce((s, p) => s + p.ms, 0) / ok.length),
          lossPct: Math.round(((samples - ok.length) / samples) * 100),
        };

  res.setHeader('cache-control', 'no-store');
  res.status(200).json({
    host,
    port,
    samples,
    region: process.env.VERCEL_REGION ?? 'unknown',
    probes,
    ...stats,
  });
}
