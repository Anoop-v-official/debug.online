import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['http-headers']!;

interface Check {
  header: string;
  present: boolean;
  value?: string;
  good: boolean;
  hint: string;
}

interface HeadersResult {
  url: string;
  finalUrl: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  checks: Check[];
  securityScore: number;
}

export default function HttpHeaders() {
  const [input, setInput] = useState('https://debugdaily.online');
  const [data, setData] = useState<HeadersResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(api(`/api/http-headers?url=${encodeURIComponent(input.trim())}`));
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setData((await r.json()) as HeadersResult);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'fetch failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolFrame tool={tool}>
      <form onSubmit={go} className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input flex-1 min-w-[240px] font-mono"
          placeholder="https://example.com"
          spellCheck={false}
        />
        <button type="submit" className="btn-accent" disabled={busy}>
          {busy ? 'Inspecting…' : 'Inspect'}
        </button>
      </form>

      {err ? <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre> : null}

      {data ? (
        <div className="mt-4 space-y-4">
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={
                  'chip ' +
                  (data.status >= 200 && data.status < 400
                    ? 'text-accent border-accent/30 bg-accent/10'
                    : 'text-error border-error/30 bg-error/10')
                }
              >
                {data.status} {data.statusText}
              </span>
              <span className="font-mono text-xs text-muted break-all">{data.finalUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-wide text-subtle">Security</span>
              <span
                className={`font-display text-2xl font-bold ${
                  data.securityScore >= 80
                    ? 'text-accent'
                    : data.securityScore >= 50
                    ? 'text-warning'
                    : 'text-error'
                }`}
              >
                {data.securityScore}
              </span>
              <span className="text-xs text-subtle">/ 100</span>
            </div>
          </div>

          <div className="card p-3">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
              Security headers
            </div>
            <ul className="space-y-1.5 text-xs font-mono">
              {data.checks.map((c) => (
                <li key={c.header} className="flex items-start gap-2">
                  <span className={c.good ? 'text-accent' : c.present ? 'text-warning' : 'text-error'}>
                    {c.good ? '✓' : c.present ? '~' : '✕'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-text">{c.header}</div>
                    <div className="text-subtle text-2xs">{c.hint}</div>
                    {c.value ? (
                      <div className="text-muted break-all mt-0.5">{c.value}</div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <details className="card p-3">
            <summary className="cursor-pointer text-2xs uppercase tracking-wide text-subtle font-mono">
              All response headers ({Object.keys(data.headers).length})
            </summary>
            <ul className="mt-2 text-xs font-mono space-y-0.5">
              {Object.entries(data.headers).map(([k, v]) => (
                <li key={k} className="flex gap-2">
                  <span className="text-muted">{k}</span>
                  <span className="text-text break-all">{v}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      ) : null}
    </ToolFrame>
  );
}
