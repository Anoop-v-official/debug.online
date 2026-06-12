import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { toolBySlug, categoryLabels, type Category } from '../lib/tools';
import { countryName, flagEmoji } from '../lib/countries';

interface ToolRow {
  slug: string;
  count: number;
}

interface StatsResponse {
  tools: ToolRow[];
  totalCount: number;
  totalTools: number;
}

interface CountryRow {
  code: string;
  count: number;
}

interface OverviewResponse {
  liveUsers: number;
  totalVisits: number;
  distinctTools: number;
  topTool: string | null;
  topToolCount: number;
  countries: CountryRow[];
  distinctCountries: number;
}

const CAT_COLOR: Record<Category, string> = {
  encode: 'bg-role-security/40',
  format: 'bg-role-backend/40',
  inspect: 'bg-role-frontend/40',
  generate: 'bg-accent/40',
  network: 'bg-role-devops/40',
  convert: 'bg-role-sysadmin/40',
};

export function Stats() {
  useSeo({
    title: 'Most-used Tools — debugdaily Stats',
    description:
      'Live ranking of the most-used tools on debugdaily.online. Updated continuously from real session traffic, no cookies.',
    path: '/stats',
  });

  const [data, setData] = useState<StatsResponse | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/metrics?kind=tools&limit=50').then((r) =>
        r.ok ? (r.json() as Promise<StatsResponse>) : Promise.reject(new Error(`HTTP ${r.status}`)),
      ),
      fetch('/api/metrics?kind=overview').then((r) =>
        r.ok ? (r.json() as Promise<OverviewResponse>) : Promise.reject(new Error(`HTTP ${r.status}`)),
      ),
    ])
      .then(([t, o]) => {
        if (cancelled) return;
        setData(t);
        setOverview(o);
      })
      .catch((e: unknown) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load stats');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <article className="max-w-3xl space-y-4">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Most-used tools
        </h1>
        <p className="text-error text-sm">Could not load stats: {err}</p>
      </article>
    );
  }

  if (!data) {
    return (
      <article className="max-w-3xl space-y-4 animate-pulse">
        <div className="h-8 w-1/3 rounded bg-surface" />
        <div className="h-4 w-1/2 rounded bg-surface" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-surface" />
          ))}
        </div>
      </article>
    );
  }

  const known = data.tools.filter((t) => toolBySlug[t.slug]);
  const max = known.length > 0 ? known[0].count : 0;

  const topToolName = overview?.topTool
    ? toolBySlug[overview.topTool]?.name ?? overview.topTool
    : known[0]
      ? toolBySlug[known[0].slug]?.name ?? known[0].slug
      : '—';

  return (
    <article className="max-w-3xl space-y-6">
      <header className="space-y-2 border-b border-border pb-5">
        <div className="text-2xs uppercase tracking-widest font-mono text-subtle">
          Live · updated every minute
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Site stats
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Real session traffic from this site, no cookies and no personal data
          attached. Each session counts a tool once, so reloads do not inflate
          the numbers. Counting started June 2026, so newer additions have had
          less time to accumulate opens.
        </p>
      </header>

      {overview ? (
        <section className="space-y-3">
          <div className="text-2xs uppercase tracking-widest font-mono text-subtle">
            Site overview
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              label="Live now"
              value={overview.liveUsers.toLocaleString()}
              pulse={overview.liveUsers > 0}
            />
            <Stat
              label="Total visits"
              value={overview.totalVisits.toLocaleString()}
            />
            <Stat
              label="Tool opens"
              value={data.totalCount.toLocaleString()}
            />
            <Stat
              label="Countries"
              value={overview.distinctCountries.toLocaleString()}
            />
          </div>
        </section>
      ) : null}

      {overview && overview.countries.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xs uppercase tracking-widest font-mono text-subtle">
              Visitors by country
            </div>
            <div className="text-2xs font-mono text-subtle">
              top 10 of {overview.distinctCountries.toLocaleString()}
            </div>
          </div>
          <ol className="space-y-1.5">
            {(() => {
              const max = overview.countries[0]?.count ?? 0;
              return overview.countries.map((c, i) => {
                const pct = max > 0 ? (c.count / max) * 100 : 0;
                return (
                  <li
                    key={c.code}
                    className="rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xs text-subtle font-mono w-6 text-right tabular-nums">
                        {i + 1}
                      </span>
                      <span className="text-lg leading-none" aria-hidden>
                        {flagEmoji(c.code)}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-text truncate">
                            {countryName(c.code)}
                          </span>
                          <span className="text-2xs text-subtle font-mono tabular-nums shrink-0">
                            {c.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-bg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-accent/30"
                            style={{ width: `${pct}%` }}
                            aria-hidden
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              });
            })()}
          </ol>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="text-2xs uppercase tracking-widest font-mono text-subtle">
          Most-used tools
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat label="Top tool" value={topToolName} small />
          <Stat
            label="Top tool opens"
            value={(overview?.topToolCount ?? known[0]?.count ?? 0).toLocaleString()}
          />
        </div>
      </section>

      {known.length === 0 ? (
        <p className="text-sm text-subtle">No data yet — open a tool to start counting.</p>
      ) : (
        <ol className="space-y-1.5">
          {known.map((row, i) => {
            const tool = toolBySlug[row.slug];
            if (!tool) return null;
            const pct = max > 0 ? (row.count / max) * 100 : 0;
            return (
              <li key={row.slug}>
                <Link
                  to={`/tools/${tool.slug}`}
                  className="group block rounded-md border border-border bg-surface px-3 py-2 hover:border-border-strong hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xs text-subtle font-mono w-6 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm text-text group-hover:text-accent transition-colors truncate">
                          {tool.name}
                        </span>
                        <span className="text-2xs text-subtle font-mono tabular-nums shrink-0">
                          {row.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-bg overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 ${CAT_COLOR[tool.category]}`}
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                      <div className="text-2xs text-subtle font-mono">
                        {categoryLabels[tool.category]}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <footer className="text-2xs text-subtle font-mono pt-4 border-t border-border">
        Counted in your own KV store. Nothing tracked about you personally — only
        which tool slug was opened in a given session.
      </footer>
    </article>
  );
}

function Stat({
  label,
  value,
  small = false,
  pulse = false,
}: {
  label: string;
  value: string;
  small?: boolean;
  pulse?: boolean;
}) {
  return (
    <div className="card p-3 space-y-1">
      <div className="text-2xs uppercase tracking-wide font-mono text-subtle flex items-center gap-1.5">
        {pulse ? (
          <span className="relative inline-flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
        ) : null}
        {label}
      </div>
      <div
        className={`font-display font-semibold text-text ${small ? 'text-base truncate' : 'text-2xl tabular-nums'}`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
