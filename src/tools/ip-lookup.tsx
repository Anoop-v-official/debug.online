import { useEffect, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['ip-lookup']!;

interface IpInfo {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  asn?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

async function fetchInfo(ip: string): Promise<IpInfo> {
  const url = api(ip ? `/api/ip-lookup?ip=${encodeURIComponent(ip)}` : '/api/ip-lookup');
  const r = await fetch(url);
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${r.status}`);
  }
  return (await r.json()) as IpInfo;
}

export default function IpLookup() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<IpInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Auto-detect on first mount
    setBusy(true);
    fetchInfo('')
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'lookup failed'))
      .finally(() => setBusy(false));
  }, []);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      setData(await fetchInfo(input.trim()));
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
          placeholder="Leave empty for your own IP, or enter 8.8.8.8"
          spellCheck={false}
        />
        <button type="submit" className="btn-accent" disabled={busy}>
          {busy ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      {err ? <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre> : null}

      {data ? (
        <div className="space-y-4 mt-4">
          <div className="card p-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-2xl font-semibold">{data.ip}</span>
            {data.countryCode ? (
              <span className="chip text-accent border-accent/30 bg-accent/10">
                {data.countryCode}
              </span>
            ) : null}
            {data.proxy ? <span className="chip text-warning border-warning/40 bg-warning/10">VPN / Proxy</span> : null}
            {data.hosting ? <span className="chip text-cyan border-cyan/40 bg-cyan/10">Hosting</span> : null}
            {data.mobile ? <span className="chip">Mobile</span> : null}
          </div>

          <div className="card p-3 text-sm font-mono divide-y divide-border">
            <Row label="Location" value={[data.city, data.region, data.country].filter(Boolean).join(', ')} />
            <Row label="ZIP" value={data.zip} />
            <Row label="Coordinates" value={data.lat && data.lon ? `${data.lat}, ${data.lon}` : undefined} />
            <Row label="Timezone" value={data.timezone} />
            <Row label="ISP" value={data.isp} />
            <Row label="Organization" value={data.org} />
            <Row label="ASN" value={data.asn} />
            <Row label="Reverse DNS" value={data.reverse} />
          </div>

          <InsightPanel toolSlug={tool.slug} input={data.ip} output={data} />
        </div>
      ) : null}
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
