import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { toolBySlug, categoryLabels, type Category } from '../lib/tools';

interface Overview {
  topTool: string | null;
  topToolCount: number;
}

const CAT_DOT: Record<Category, string> = {
  encode: 'bg-role-security',
  format: 'bg-role-backend',
  inspect: 'bg-role-frontend',
  generate: 'bg-accent',
  network: 'bg-role-devops',
  convert: 'bg-role-sysadmin',
};

export function TrendingTool() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/metrics?kind=overview')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Overview) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        /* silent */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data?.topTool) return null;
  const tool = toolBySlug[data.topTool];
  if (!tool) return null;
  if (data.topToolCount <= 0) return null;

  return (
    <div className="mb-6">
      <Link
        to={`/tools/${tool.slug}`}
        className="group inline-flex w-full max-w-full items-center gap-2 rounded-md border border-border bg-surface/60 hover:border-border-strong hover:bg-surface-2 transition-colors px-3 py-2 text-sm"
        aria-label={`Trending tool: ${tool.name}`}
      >
        <Flame className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
        <span className="text-2xs uppercase tracking-widest font-mono text-subtle shrink-0 hidden sm:inline">
          Trending
        </span>
        <span
          aria-hidden
          className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[tool.category]} shrink-0`}
        />
        <span className="text-text truncate group-hover:text-accent transition-colors">
          {tool.name}
        </span>
        <span className="text-2xs text-subtle font-mono shrink-0 hidden sm:inline">
          · {categoryLabels[tool.category]}
        </span>
        <span className="ml-auto text-2xs text-subtle font-mono tabular-nums shrink-0">
          {data.topToolCount.toLocaleString()} opens
        </span>
        <ArrowRight
          className="w-3.5 h-3.5 text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0"
          aria-hidden
        />
      </Link>
    </div>
  );
}
