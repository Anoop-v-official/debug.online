import { useEffect, useState } from 'react';

interface Props {
  toolSlug: string;
  input: unknown;
  output: unknown;
  enabled?: boolean;
}

interface Insight {
  summary: string;
  notes: string[];
  source: 'ai' | 'fallback';
}

export function InsightPanel({ toolSlug, input, output, enabled = true }: Props) {
  const [data, setData] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const hasInput =
      input !== undefined && input !== null && String(input).trim() !== '';
    if (!hasInput) {
      setData(null);
      setErr(null);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ tool: toolSlug, input, output }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Insight;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'unknown');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [toolSlug, input, output, enabled]);

  if (!enabled) return null;

  return (
    <aside className="card p-4 space-y-2 border-dashed">
      <div className="flex items-center justify-between">
        <span className="text-2xs uppercase tracking-wide text-subtle font-mono">
          Smart context
        </span>
        {loading ? (
          <span className="text-2xs text-subtle animate-pulse-soft">thinking…</span>
        ) : null}
      </div>
      {err ? (
        <p className="text-xs text-muted">
          Insights unavailable right now. The tool itself still works.
        </p>
      ) : data ? (
        <div className="space-y-2">
          <p className="text-sm text-text leading-relaxed">{data.summary}</p>
          {data.notes.length > 0 ? (
            <ul className="text-xs text-muted space-y-1 list-disc pl-4">
              {data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
          {data.source === 'fallback' ? (
            <p className="text-2xs text-subtle font-mono">
              Set ANTHROPIC_API_KEY for AI-powered insights.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-subtle">
          Enter input above to see context, anomalies and suggested next moves.
        </p>
      )}
    </aside>
  );
}
