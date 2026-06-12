import { Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toolBySlug } from '../lib/tools';
import { NotFound } from './NotFound';

export function EmbedPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? toolBySlug[slug] : undefined;

  // Notify the host page (if we're in an iframe) of our content height,
  // so it can resize the iframe to fit.
  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window) return;

    let lastHeight = 0;
    function sendHeight() {
      const h = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      if (h === lastHeight) return;
      lastHeight = h;
      window.parent.postMessage(
        { type: 'debugdaily-resize', slug, height: h },
        '*',
      );
    }

    // Initial + on resize + via ResizeObserver for content changes.
    sendHeight();
    window.addEventListener('resize', sendHeight);
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.body);

    // Also re-send on a slow tick to catch async content that finishes loading.
    const id = window.setInterval(sendHeight, 1000);

    return () => {
      window.removeEventListener('resize', sendHeight);
      ro.disconnect();
      window.clearInterval(id);
    };
  }, [slug]);

  if (!tool) return <NotFound />;
  const Component = tool.Component;

  return (
    <div className="min-h-[400px] p-4 sm:p-5 bg-bg text-text">
      <Suspense
        fallback={
          <div className="space-y-3 animate-pulse">
            <div className="h-6 w-1/3 rounded bg-surface" />
            <div className="h-[260px] rounded bg-surface-2" />
          </div>
        }
      >
        <Component />
      </Suspense>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-2xs font-mono text-subtle">
        <span>Powered by</span>
        <a
          href={`https://debugdaily.online/tools/${tool.slug}?utm_source=embed`}
          target="_blank"
          rel="noopener"
          className="text-accent hover:underline"
        >
          debug<span className="text-text">&lt;daily&gt;</span> ·{' '}
          <span className="text-muted">{tool.name}</span>
        </a>
      </div>
    </div>
  );
}
