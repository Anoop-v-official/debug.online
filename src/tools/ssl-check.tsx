import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['ssl-check']!;

interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  altNames: string[];
  protocol?: string;
}

export default function SslCheck() {
  const [host, setHost] = useState('example.com');
  const [data, setData] = useState<CertInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/ssl?host=${encodeURIComponent(host)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setData((await res.json()) as CertInfo);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'check failed');
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
          className="input flex-1 min-w-[200px]"
          placeholder="example.com"
          spellCheck={false}
        />
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? 'Checking…' : 'Check'}
        </button>
      </form>

      <div className="mt-4 space-y-4">
        {err ? <pre className="card p-3 text-xs font-mono text-error">{err}</pre> : null}
        {data ? (
          <div className="card p-3 text-sm font-mono space-y-1.5">
            <Row label="Subject" value={data.subject} />
            <Row label="Issuer" value={data.issuer} />
            <Row label="Valid from" value={data.validFrom} />
            <Row label="Valid to" value={data.validTo} />
            <Row
              label="Days left"
              value={
                <span
                  className={
                    data.daysRemaining < 0
                      ? 'text-error'
                      : data.daysRemaining < 14
                      ? 'text-warning'
                      : 'text-accent'
                  }
                >
                  {data.daysRemaining}
                </span>
              }
            />
            {data.protocol ? <Row label="Protocol" value={data.protocol} /> : null}
            {data.altNames.length > 0 ? (
              <Row label="SAN" value={data.altNames.join(', ')} />
            ) : null}
          </div>
        ) : null}
        <InsightPanel toolSlug={tool.slug} input={{ host }} output={data} />
      </div>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-20 shrink-0">
        {label}
      </span>
      <span className="text-text break-all">{value}</span>
    </div>
  );
}
