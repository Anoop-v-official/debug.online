import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { toolBySlug, categoryLabels, type Category } from '../lib/tools';

interface Overview {
  topTool: string | null;
  topToolCount: number;
}

const CAT_ACCENT: Record<Category, string> = {
  encode: 'border-role-security/40 bg-role-security/5 text-role-security',
  format: 'border-role-backend/40 bg-role-backend/5 text-role-backend',
  inspect: 'border-role-frontend/40 bg-role-frontend/5 text-role-frontend',
  generate: 'border-accent/40 bg-accent/5 text-accent',
  network: 'border-role-devops/40 bg-role-devops/5 text-role-devops',
  convert: 'border-role-sysadmin/40 bg-role-sysadmin/5 text-role-sysadmin',
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
        /* silent — the widget just hides */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data?.topTool) return null;
  const tool = toolBySlug[data.topTool];
  if (!tool) return null;
  if (data.topToolCount <= 0) return null;

  const accent = CAT_ACCENT[tool.category];

  return (
    <section
      aria-label="Trending tool"
      className={`mb-6 rounded-xl border ${accent} backdrop-blur-sm`}
    >
      <Link
        to={`/tools/${tool.slug}`}
        className="group flex items-center gap-3 p-4 sm:p-5"
      >
        <span
          aria-hidden
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md border border-current/30 bg-current/10"
        >
          <Flame className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs uppercase tracking-widest font-mono opacity-80">
              Trending right now
            </span>
            <span className="chip border-current/30 bg-current/10">
              {categoryLabels[tool.category]}
            </span>
          </div>
          <div className="font-display text-base sm:text-lg font-semibold text-text mt-0.5">
            {tool.name}
          </div>
          <div className="text-xs text-muted mt-0.5 line-clamp-1">
            {tool.description}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
          <div className="text-2xs uppercase tracking-wide font-mono opacity-70">
            Opens
          </div>
          <div className="font-display text-xl font-semibold text-text tabular-nums">
            {data.topToolCount.toLocaleString()}
          </div>
        </div>
        <ArrowRight
          className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform shrink-0"
          aria-hidden
        />
      </Link>
    </section>
  );
}
