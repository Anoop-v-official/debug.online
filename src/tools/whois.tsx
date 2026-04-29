import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['whois']!;

interface WhoisData {
  domain: string;
  handle?: string;
  status: string[];
  registered?: string;
  changed?: string;
  expires?: string;
  registrar?: string;
  registrant?: string;
  nameservers: string[];
}

export default function Whois() {
  const [input, setInput] = useState('debugdaily.online');
  const [data, setData] = useState<WhoisData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(api(`/api/whois?domain=${encodeURIComponent(input.trim())}`));
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setData((await r.json()) as WhoisData);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'lookup failed');
    } finally {
      setBusy(false);
    }
  }

  function expiryColor(): string {
    if (!data?.expires) return 'text-text';
    const ms = Date.parse(data.expires) - Date.now();
    const days = ms / 86_400_000;
    if (days < 0) return 'text-error';
    if (days < 30) return 'text-warning';
    return 'text-accent';
  }

  return (
    <ToolFrame tool={tool}>
      <form onSubmit={go} className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input flex-1 min-w-[200px] font-mono"
          placeholder="example.com"
          spellCheck={false}
        />
        <button type="submit" className="btn-accent" disabled={busy}>
          {busy ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      {err ? <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre> : null}

      {data ? (
        <div className="space-y-4 mt-4">
          <div className="card p-3 text-sm font-mono divide-y divide-border">
            <Row label="Domain" value={data.domain} />
            <Row label="Registrar" value={data.registrar} />
            <Row label="Registrant" value={data.registrant} />
            <Row label="Registered" value={data.registered ? formatDate(data.registered) : undefined} />
            <Row label="Updated" value={data.changed ? formatDate(data.changed) : undefined} />
            {data.expires ? (
              <div className="flex gap-2 py-1.5 px-2">
                <span className="text-subtle text-2xs uppercase tracking-wide w-32 shrink-0">
                  Expires
                </span>
                <span className={`break-all ${expiryColor()}`}>
                  {formatDate(data.expires)}
                </span>
              </div>
            ) : null}
          </div>

          {data.status.length > 0 ? (
            <div className="card p-3">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
                Status
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.status.map((s, i) => (
                  <span key={i} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {data.nameservers.length > 0 ? (
            <div className="card p-3">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
                Nameservers
              </div>
              <ul className="text-xs font-mono space-y-1">
                {data.nameservers.map((n) => (
                  <li key={n} className="text-text">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <InsightPanel toolSlug={tool.slug} input={input} output={data} />
        </div>
      ) : null}

      <p className="text-2xs text-subtle font-mono mt-4">
        Backed by RDAP (modern WHOIS over JSON). Some TLDs return less detail than others; ccTLDs vary the most.
      </p>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-1.5 px-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-32 shrink-0">{label}</span>
      <span className="text-text break-all">{value}</span>
    </div>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toUTCString();
}
