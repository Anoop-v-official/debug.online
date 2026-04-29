import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['cidr-calculator']!;

interface Result {
  network: string;
  broadcast: string;
  netmask: string;
  wildcard: string;
  firstUsable: string;
  lastUsable: string;
  total: number;
  usable: number;
  prefix: number;
  cidr: string;
}

function ipToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) >>> 0;
    n = (n + v) >>> 0;
  }
  return n >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function compute(input: string): { ok: true; r: Result } | { ok: false; error: string } {
  const m = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\/(\d{1,2}))?$/.exec(input.trim());
  if (!m) return { ok: false, error: 'Use the form 192.168.1.0/24 or 10.0.0.5' };
  const ip = ipToInt(m[1]);
  if (ip === null) return { ok: false, error: 'Octets must be 0–255.' };
  const prefix = m[2] === undefined ? 32 : Number(m[2]);
  if (prefix < 0 || prefix > 32) return { ok: false, error: 'Prefix must be 0–32.' };
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = prefix === 32 ? 1 : prefix === 31 ? 2 : 2 ** (32 - prefix);
  const usable = total <= 2 ? total : total - 2;
  const firstUsable = total <= 2 ? network : (network + 1) >>> 0;
  const lastUsable = total <= 2 ? broadcast : (broadcast - 1) >>> 0;
  return {
    ok: true,
    r: {
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      netmask: intToIp(mask),
      wildcard: intToIp(~mask >>> 0),
      firstUsable: intToIp(firstUsable),
      lastUsable: intToIp(lastUsable),
      total,
      usable,
      prefix,
      cidr: `${intToIp(network)}/${prefix}`,
    },
  };
}

export default function CidrCalculator() {
  const [input, setInput] = useState('192.168.1.0/24');
  const result = useMemo(() => compute(input), [input]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          placeholder="192.168.1.0/24"
          spellCheck={false}
        />
        {result.ok ? (
          <div className="card p-3 text-sm font-mono divide-y divide-border">
            <Row label="CIDR" value={result.r.cidr} />
            <Row label="Network" value={result.r.network} />
            <Row label="Broadcast" value={result.r.broadcast} />
            <Row label="Netmask" value={result.r.netmask} />
            <Row label="Wildcard" value={result.r.wildcard} />
            <Row label="First usable" value={result.r.firstUsable} />
            <Row label="Last usable" value={result.r.lastUsable} />
            <Row label="Total" value={result.r.total.toLocaleString()} />
            <Row label="Usable" value={result.r.usable.toLocaleString()} />
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">{result.error}</pre>
        )}
      </div>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 px-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-32 shrink-0">{label}</span>
      <span className="text-text break-all">{value}</span>
    </div>
  );
}
