import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ToolsResponse {
  tools: Array<{ slug: string; count: number }>;
}

let cache: Map<string, number> | null = null;
let inflight: Promise<Map<string, number>> | null = null;

async function fetchToolCounts(): Promise<Map<string, number>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/api/metrics?kind=tools&limit=100')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
    .then((d: ToolsResponse) => {
      const m = new Map<string, number>();
      for (const t of d.tools) m.set(t.slug, t.count);
      cache = m;
      return m;
    })
    .catch(() => new Map<string, number>())
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function ToolViewCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchToolCounts().then((m) => {
      if (cancelled) return;
      setCount(m.get(slug) ?? 0);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (count === null || count <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-2xs text-subtle font-mono"
      title={`${count.toLocaleString()} sessions opened this tool`}
    >
      <Eye className="w-3 h-3" aria-hidden />
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </span>
  );
}
