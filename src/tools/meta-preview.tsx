import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { api } from '../lib/apiBase';

const tool = toolBySlug['meta-preview']!;

interface MetaResult {
  url: string;
  finalUrl: string;
  title?: string;
  description?: string;
  canonical?: string;
  og: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
    type?: string;
  };
  twitter: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

export default function MetaPreview() {
  const [input, setInput] = useState('https://debugdaily.online');
  const [data, setData] = useState<MetaResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(api(`/api/meta-preview?url=${encodeURIComponent(input.trim())}`));
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setData((await r.json()) as MetaResult);
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
          {busy ? 'Fetching…' : 'Preview'}
        </button>
      </form>

      {err ? <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre> : null}

      {data ? (
        <div className="mt-4 space-y-4">
          <Preview kind="Google" data={data} />
          <Preview kind="Twitter" data={data} />
          <Preview kind="Facebook / LinkedIn" data={data} />

          <details className="card p-3">
            <summary className="cursor-pointer text-2xs uppercase tracking-wide text-subtle font-mono">
              Raw meta values
            </summary>
            <pre className="mt-2 text-xs font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      ) : null}
    </ToolFrame>
  );
}

function Preview({ kind, data }: { kind: 'Google' | 'Twitter' | 'Facebook / LinkedIn'; data: MetaResult }) {
  const title = kind === 'Google' ? data.title : data.og.title ?? data.title;
  const desc = kind === 'Google' ? data.description : data.og.description ?? data.description;
  const image = kind === 'Twitter' ? data.twitter.image ?? data.og.image : data.og.image;
  const host = (() => {
    try {
      return new URL(data.finalUrl).host;
    } catch {
      return '';
    }
  })();

  return (
    <div className="card p-3 space-y-2">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">{kind}</div>
      {kind === 'Google' ? (
        <div className="space-y-0.5">
          <div className="text-2xs text-muted">{host}</div>
          <div className="text-base text-cyan hover:underline cursor-pointer line-clamp-1">{title}</div>
          <div className="text-sm text-muted line-clamp-2">{desc}</div>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          {image ? (
            <img
              src={image}
              alt=""
              className="w-full h-48 object-cover bg-surface-2"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
          ) : (
            <div className="w-full h-32 bg-surface-2 flex items-center justify-center text-subtle text-sm">
              No og:image set
            </div>
          )}
          <div className="p-3 space-y-1 bg-surface-2">
            <div className="text-2xs uppercase tracking-wide text-subtle">{host}</div>
            <div className="text-sm font-medium text-text line-clamp-2">{title}</div>
            <div className="text-xs text-muted line-clamp-2">{desc}</div>
          </div>
        </div>
      )}
    </div>
  );
}
