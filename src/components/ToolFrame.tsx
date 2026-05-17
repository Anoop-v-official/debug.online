import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { type Tool, categoryLabels } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';
import { useSeo } from '../lib/seo';
import { AdSlot } from './AdSlot';
import { ToolContentBlock } from './ToolContentBlock';
import { RelatedTools } from './RelatedTools';
import { ShareButton } from './ShareButton';
import { loadShare } from '../lib/shareClient';

const AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT_TOOL ?? '';

/**
 * If a tool wants to support shareable state, it passes `share` with two
 * functions: getState (called when the user clicks Share) and applyState
 * (called when the page loads with ?s=<id>).
 */
export interface ShareConfig {
  getState: () => unknown;
  applyState: (state: unknown) => void;
}

export function ToolFrame({
  tool,
  actions,
  children,
  share,
}: {
  tool: Tool;
  actions?: ReactNode;
  children: ReactNode;
  share?: ShareConfig;
}) {
  const fav = useFavoritesStore((s) => s.slugs.includes(tool.slug));
  const toggle = useFavoritesStore((s) => s.toggle);
  const location = useLocation();
  const navigate = useNavigate();

  // Latest applyState in a ref so we don't refire the hydration effect when
  // the consuming tool re-renders.
  const applyRef = useRef(share?.applyState);
  useEffect(() => {
    applyRef.current = share?.applyState;
  });

  // Hydrate ?s=<id> on mount.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('s');
    if (!id) return;
    let cancelled = false;
    (async () => {
      const state = await loadShare(id, tool.slug);
      if (cancelled) return;
      if (state !== null && applyRef.current) {
        try {
          applyRef.current(state);
        } catch {
          /* tolerate shape changes between versions */
        }
      }
      // Always strip ?s= from the URL — keeps the address bar clean and
      // prevents accidental re-sharing of the same id when someone bookmarks.
      navigate(`/tools/${tool.slug}`, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          name: tool.name,
          description: tool.seo.description,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any (browser)',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          url: `https://debugdaily.online/tools/${tool.slug}`,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'debugdaily',
              item: 'https://debugdaily.online/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: tool.name,
              item: `https://debugdaily.online/tools/${tool.slug}`,
            },
          ],
        },
      ],
    }),
    [tool],
  );

  useSeo({
    title: tool.seo.title,
    description: tool.seo.description,
    path: `/tools/${tool.slug}`,
    jsonLd,
  });

  const hasActions = !!actions || !!share;

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
        {hasActions ? (
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
            {share ? <ShareButton toolSlug={tool.slug} getState={share.getState} /> : null}
          </div>
        ) : null}
      </div>
      <div className="card p-4 sm:p-5">{children}</div>
      <AdSlot slot={AD_SLOT} />
      <ToolContentBlock tool={tool} />
      <RelatedTools tool={tool} />
    </div>
  );
}
