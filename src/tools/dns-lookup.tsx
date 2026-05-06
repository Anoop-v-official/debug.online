import { useEffect, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';
import { dnsLookup, type DnsAnswer } from '../lib/dnsClient';
import { consumeSmartPaste } from '../lib/smartPaste';

const tool = toolBySlug['dns-lookup']!;

const TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'] as const;
type RecordType = (typeof TYPES)[number];

type Answer = DnsAnswer;

export default function DnsLookup() {
  const [host, setHost] = useState('example.com');
  const [type, setType] = useState<RecordType>('A');
  const [data, setData] = useState<Answer | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const pasted = consumeSmartPaste('dns-lookup');
    if (!pasted) return;
    setHost(pasted);
    setBusy(true);
    setErr(null);
    dnsLookup(pasted, 'A')
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'lookup failed'))
      .finally(() => setBusy(false));
  }, []);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      setData(await dnsLookup(host, type));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'lookup failed');
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
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RecordType)}
          className="input w-auto py-1.5"
          aria-label="Record type"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="btn-accent">
          {busy ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      <div className="mt-4 space-y-4">
        {err ? (
          <pre className="card p-3 text-xs font-mono text-error">{err}</pre>
        ) : null}
        {data ? (
          <div className="card p-3">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
              {data.type} · {data.records.length} record{data.records.length === 1 ? '' : 's'}
            </div>
            {data.records.length === 0 ? (
              <div className="text-sm text-subtle">No records returned.</div>
            ) : (
              <ul className="text-xs font-mono space-y-1">
                {data.records.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 border-b border-border last:border-0 py-1">
                    <span className="text-text break-all">{r.value}</span>
                    <span className="text-subtle shrink-0">
                      {r.priority !== undefined ? `prio ${r.priority} · ` : ''}
                      {r.ttl !== undefined ? `ttl ${r.ttl}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
        <InsightPanel toolSlug={tool.slug} input={{ host, type }} output={data} />
      </div>
    </ToolFrame>
  );
}
