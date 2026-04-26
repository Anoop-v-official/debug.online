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
          <div className="flex items-center gap-2 text-2xs text-subtle font-mono mb-1">
            <Link to="/" className="hover:text-text">
              ← back
            </Link>
            <span>·</span>
            <span className="chip">{categoryLabels[tool.category]}</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {tool.name}
            <button
              type="button"
              onClick={() => toggle(tool.slug)}
              aria-label={fav ? 'Unfavorite' : 'Favorite'}
              className="text-muted hover:text-accent transition-colors text-base"
            >
              {fav ? '★' : '☆'}
            </button>
          </h1>
          <p className="text-sm text-muted mt-1">{tool.description}</p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="card p-4 sm:p-5">{children}</div>
      <AdSlot slot={AD_SLOT} />
      <ToolContentBlock content={tool.content} name={tool.name} />
    </div>
  );
}
