import { useEffect, useRef } from 'react';

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders a single AdSense ad unit. Returns null if AdSense is not configured
 * (no client ID set, or no slot passed). The script itself is loaded site-wide
 * by <AdSenseScript/>; this component only renders the placeholder <ins> tag
 * and pushes a request for AdSense to fill it.
 */
export function AdSlot({
  slot,
  layout = 'auto',
  format = 'auto',
}: {
  slot: string;
  layout?: string;
  format?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* swallow — ad blockers, offline, or script not yet loaded */
    }
  }, [slot]);

  if (!CLIENT || !slot) return null;

  return (
    <div className="my-6 text-center">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
        Sponsored
      </div>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}
