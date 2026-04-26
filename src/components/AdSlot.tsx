import { useEffect, useRef } from 'react';

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
const SCRIPT_ID = 'adsbygoogle-js';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function ensureScript(client: string): void {
  if (document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement('script');
  s.id = SCRIPT_ID;
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
}

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
    ensureScript(CLIENT);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* swallow — ad blockers, offline, etc. */
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
