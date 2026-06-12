import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { type Tool, categoryLabels } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';
import { useSeo } from '../lib/seo';
import { AdSlot } from './AdSlot';
import { ToolContentBlock } from './ToolContentBlock';
import { RelatedTools } from './RelatedTools';
import { ShareButton } from './ShareButton';
import { EmbedModal } from './EmbedModal';
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
  const [embedOpen, setEmbedOpen] = useState(false);
  const isEmbed = location.pathname.startsWith('/embed/');

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

  const jsonLd = useMemo(() => {
    const graph: Array<Record<string, unknown>> = [
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
    ];

    if (tool.content.faq && tool.content.faq.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: tool.content.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }, [tool]);

  useSeo({
    title: tool.seo.title,
    description: tool.seo.description,
    path: `/tools/${tool.slug}`,
    jsonLd,
  });

  // Embed mode: bare tool, no chrome, no ads, no long-form content.
  if (isEmbed) {
    return <div className="space-y-3">{children}</div>;
  }

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
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
          {share ? <ShareButton toolSlug={tool.slug} getState={share.getState} /> : null}
          <button
            type="button"
            onClick={() => setEmbedOpen(true)}
            aria-label="Embed this tool"
            title="Embed this tool on your site"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-surface text-muted text-sm hover:border-border-strong hover:text-text transition-colors"
          >
            <Code2 className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">Embed</span>
          </button>
        </div>
      </div>
      <div className="card p-4 sm:p-5">{children}</div>
      <AdSlot slot={AD_SLOT} />
      <ToolContentBlock tool={tool} />
      <RelatedTools tool={tool} />
      <EmbedModal
        open={embedOpen}
        onClose={() => setEmbedOpen(false)}
        tool={tool}
      />
    </div>
  );
}

