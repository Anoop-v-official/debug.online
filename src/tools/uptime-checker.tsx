import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['uptime-checker']!;

interface UptimeResult {
  url: string;
  finalUrl: string;
  status: number;
  statusText: string;
  ok: boolean;
  redirects: Array<{ url: string; status: number }>;
  totalMs: number;
  error?: string;
}

export default function UptimeChecker() {
  const [input, setInput] = useState('https://debugdaily.online');
  const [data, setData] = useState<UptimeResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(api(`/api/uptime?url=${encodeURIComponent(input.trim())}`));
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setData((await r.json()) as UptimeResult);
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
          {busy ? 'Checking…' : 'Check'}
        </button>
      </form>

      {err ? <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre> : null}

      {data ? (
        <div className="mt-4 space-y-4">
          <div className="card p-4 flex flex-wrap items-center gap-4">
            <div
              className={`font-display text-3xl font-bold ${
                data.ok ? 'text-accent' : 'text-error'
              }`}
            >
              {data.ok ? 'UP' : 'DOWN'}
            </div>
            <div className="text-sm font-mono space-y-0.5">
              <div className="text-text">
                {data.status} {data.statusText}
              </div>
              <div className="text-subtle">
                {data.totalMs} ms · {data.redirects.length} hop{data.redirects.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="ml-auto text-xs font-mono text-muted break-all">{data.finalUrl}</div>
          </div>

          {data.redirects.length > 0 ? (
            <div className="card p-3">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
                Redirect chain
              </div>
              <ol className="text-xs font-mono space-y-1">
                {data.redirects.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-subtle">{i + 1}.</span>
                    <span
                      className={
                        r.status >= 200 && r.status < 300
                          ? 'text-accent shrink-0'
                          : r.status >= 300 && r.status < 400
                          ? 'text-warning shrink-0'
                          : 'text-error shrink-0'
                      }
                    >
                      {r.status}
                    </span>
                    <span className="text-text break-all">{r.url}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {data.error ? (
            <div className="card p-3 text-xs font-mono text-error border-error/40">{data.error}</div>
          ) : null}
        </div>
      ) : null}

      <p className="text-2xs text-subtle font-mono mt-4">
        Checks from a single Vercel region — for multi-region status use a paid uptime monitor.
      </p>
    </ToolFrame>
  );
}
