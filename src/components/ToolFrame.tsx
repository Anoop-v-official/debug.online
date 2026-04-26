import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type Tool, categoryLabels } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';
import { useSeo } from '../lib/seo';
import { AdSlot } from './AdSlot';
import { ToolContentBlock } from './ToolContentBlock';

const AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT_TOOL ?? '';

export function ToolFrame({
  tool,
  actions,
  children,
}: {
  tool: Tool;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const fav = useFavoritesStore((s) => s.slugs.includes(tool.slug));
  const toggle = useFavoritesStore((s) => s.toggle);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.seo.description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: `https://debugdaily.online/tools/${tool.slug}`,
    }),
    [tool],
  );

  useSeo({
    title: tool.seo.title,
    description: tool.seo.description,
    path: `/tools/${tool.slug}`,
    jsonLd,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted font-mono mb-1.5">
            <Link to="/" className="hover:text-text transition-colors">
              ← All tools
            </Link>
            <span className="text-subtle">/</span>
            <span className="chip">{categoryLabels[tool.category]}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-3">
            {tool.name}
            <button
              type="button"
              onClick={() => toggle(tool.slug)}
              aria-label={fav ? 'Unfavorite' : 'Favorite'}
              aria-pressed={fav}
              className={`transition-colors text-xl leading-none ${
                fav ? 'text-accent' : 'text-subtle hover:text-accent'
              }`}
            >
              {fav ? '★' : '☆'}
            </button>
          </h1>
          <p className="text-sm sm:text-base text-muted mt-1.5 max-w-2xl">
            {tool.description}
          </p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="card p-4 sm:p-5">{children}</div>
      <AdSlot slot={AD_SLOT} />
      <ToolContentBlock content={tool.content} name={tool.name} />
    </div>
  );
}
