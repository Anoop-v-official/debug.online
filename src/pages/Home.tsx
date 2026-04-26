import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolGrid } from '../components/ToolGrid';
import { categoryLabels, tools, toolBySlug, type Category } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';
import { useHistoryStore } from '../store/history';
import { useSeo } from '../lib/seo';

const carbonServe = import.meta.env.VITE_CARBON_SERVE as string | undefined;

export function Home({ onOpenPalette }: { onOpenPalette: () => void }) {
  useSeo({
    title: 'debug.online — Free IT & Developer Toolkit with AI Insights',
    description: `${tools.length} fast, browser-based tools — JSON, JWT, regex, base64, DNS, SSL and more — with optional AI Smart Context that explains every result.`,
    path: '/',
  });

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const favSlugs = useFavoritesStore((s) => s.slugs);
  const history = useHistoryStore((s) => s.entries);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (filter !== 'all' && t.category !== filter) return false;
      if (!q) return true;
      const hay = [t.name, t.description, ...t.keywords].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, filter]);

  const favorites = favSlugs
    .map((s) => toolBySlug[s])
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const recent = history
    .map((e) => toolBySlug[e.slug])
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 4);

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-2 chip">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            {tools.length} tools · AI insights · 100% free
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            The IT toolkit that{' '}
            <span className="text-accent">explains itself</span>.
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            DNS, SSL, JWT, JSON, regex and more — all instant, all in your
            browser. Optional Smart Context flags anomalies and suggests the
            next move.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tools…"
            className="input max-w-sm"
            aria-label="Filter tools"
          />
          <button type="button" onClick={onOpenPalette} className="btn">
            Open palette <span className="kbd">⌘K</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <CategoryChip
            label="All"
            count={tools.length}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {(Object.keys(categoryLabels) as Category[]).map((c) => {
            const count = tools.filter((t) => t.category === c).length;
            return (
              <CategoryChip
                key={c}
                label={categoryLabels[c]}
                count={count}
                active={filter === c}
                onClick={() => setFilter(c)}
              />
            );
          })}
        </div>
      </section>

      {favorites.length > 0 || recent.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {favorites.length > 0 ? (
            <Strip title="Favorites">
              {favorites.map((t) => (
                <StripItem key={t.slug} slug={t.slug} name={t.name} />
              ))}
            </Strip>
          ) : null}
          {recent.length > 0 ? (
            <Strip title="Recent">
              {recent.map((t) => (
                <StripItem key={t.slug} slug={t.slug} name={t.name} />
              ))}
            </Strip>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wide text-subtle">
            All tools
          </h2>
          <span className="text-xs font-mono text-subtle">
            {filtered.length} / {tools.length}
          </span>
        </div>
        <ToolGrid items={filtered} />
      </section>

      {carbonServe ? (
        <section className="card p-4 text-2xs text-subtle font-mono">
          <div id="carbonads" data-serve={carbonServe} />
        </section>
      ) : null}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' +
        (active
          ? 'bg-accent/10 border-accent text-accent'
          : 'bg-surface-2 border-border text-muted hover:text-text hover:border-border-strong')
      }
    >
      <span>{label}</span>
      <span className={active ? 'text-accent/80' : 'text-subtle'}>{count}</span>
    </button>
  );
}

function Strip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-3">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
        {title}
      </div>
      <ul className="flex flex-wrap gap-1.5">{children}</ul>
    </div>
  );
}

function StripItem({ slug, name }: { slug: string; name: string }) {
  return (
    <li>
      <Link
        to={`/tools/${slug}`}
        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-surface-2 border border-border text-text hover:border-accent hover:text-accent transition-colors"
      >
        {name}
      </Link>
    </li>
  );
}
