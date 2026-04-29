import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['ip-blacklist']!;

interface CheckResult {
  list: string;
  listed: boolean;
  response?: string;
  error?: string;
}

interface BlacklistResult {
  ip: string;
  totalChecked: number;
  listedCount: number;
  clean: boolean;
  checks: CheckResult[];
}

export default function IpBlacklist() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<BlacklistResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(api(`/api/ip-blacklist?ip=${encodeURIComponent(input.trim())}`));
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setData((await r.json()) as BlacklistResult);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'lookup failed');
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
          className="input flex-1 min-w-[200px] font-mono"
          placeholder="8.8.8.8"
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
                data.clean ? 'text-accent' : 'text-error'
              }`}
            >
              {data.clean ? 'CLEAN' : 'LISTED'}
            </div>
            <div className="text-sm font-mono">
              <div className="text-text">{data.ip}</div>
              <div className="text-subtle">
                {data.listedCount} of {data.totalChecked} DNSBLs report this IP
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
              Per-list results
            </div>
            <ul className="text-xs font-mono divide-y divide-border">
              {data.checks.map((c) => (
                <li key={c.list} className="flex items-center gap-3 py-1.5">
                  <span
                    className={
                      'shrink-0 w-2 h-2 rounded-full ' +
                      (c.listed ? 'bg-error' : c.error ? 'bg-warning' : 'bg-accent')
                    }
                  />
                  <span className="flex-1 text-text">{c.list}</span>
                  <span className="text-subtle">
                    {c.listed
                      ? `LISTED (${c.response})`
                      : c.error
                      ? 'error'
                      : 'clean'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <p className="text-2xs text-subtle font-mono mt-4">
        Checks {12} DNS-based blocklists used by mail providers to score reputation. Listings affect email deliverability and outbound reputation.
      </p>
    </ToolFrame>
  );
}
