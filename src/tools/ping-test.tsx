import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['ping-test']!;

interface Probe {
  ok: boolean;
  ms: number;
  error?: string;
}

interface PingResult {
  host: string;
  port: number;
  samples: number;
  region: string;
  probes: Probe[];
  min: number;
  max: number;
  avg: number;
  lossPct: number;
}

export default function PingTest() {
  const [host, setHost] = useState('debugdaily.online');
  const [port, setPort] = useState(443);
  const [samples, setSamples] = useState(5);
  const [data, setData] = useState<PingResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const url = api(
        `/api/ping?host=${encodeURIComponent(host.trim())}&port=${port}&samples=${samples}`,
      );
      const r = await fetch(url);
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setData((await r.json()) as PingResult);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'ping failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolFrame tool={tool}>
      <form onSubmit={go} className="flex flex-wrap items-center gap-2">
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="input flex-1 min-w-[200px] font-mono"
          placeholder="example.com"
          spellCheck={false}
        />
        <label className="text-xs text-muted flex items-center gap-2">
          Port
          <input
            type="number"
            min={1}
            max={65535}
            value={port}
            onChange={(e) => setPort(Number(e.target.value) || 443)}
            className="input w-24"
          />
        </label>
        <label className="text-xs text-muted flex items-center gap-2">
          Samples
          <input
            type="number"
            min={1}
            max={10}
            value={samples}
            onChange={(e) => setSamples(Number(e.target.value) || 5)}
            className="input w-20"
          />
        </label>
        <button type="submit" className="btn-accent" disabled={busy}>
          {busy ? 'Pinging…' : 'Ping'}
        </button>
      </form>

      {err ? <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre> : null}

      {data ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Min" value={`${data.min} ms`} />
            <Stat label="Avg" value={`${data.avg} ms`} />
            <Stat label="Max" value={`${data.max} ms`} />
            <Stat
              label="Loss"
              value={`${data.lossPct}%`}
              tone={data.lossPct === 0 ? 'text-accent' : data.lossPct < 30 ? 'text-warning' : 'text-error'}
            />
          </div>

          <div className="card p-3">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
              {data.samples} TCP probes from {data.region}
            </div>
            <ul className="text-xs font-mono space-y-1">
              {data.probes.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-subtle w-8">#{i + 1}</span>
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${p.ok ? 'bg-accent' : 'bg-error'}`}
                  />
                  <span className={p.ok ? 'text-text' : 'text-error'}>
                    {p.ok ? `${p.ms} ms` : p.error ?? 'failed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <p className="text-2xs text-subtle font-mono mt-4">
        Times TCP connect to host:port from a single Vercel region. Not ICMP — serverless can't send raw pings.
      </p>
    </ToolFrame>
  );
}

function Stat({
  label,
  value,
  tone = 'text-text',
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="card p-3">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">{label}</div>
      <div className={`text-lg font-mono ${tone}`}>{value}</div>
    </div>
  );
}
