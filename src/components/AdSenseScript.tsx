import { useEffect } from 'react';

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
const SCRIPT_ID = 'adsbygoogle-js';
const META_ID = 'adsense-verify';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Loads the Google AdSense script + verification meta tag site-wide when
 * VITE_ADSENSE_CLIENT is set. Necessary so AdSense's reviewer can verify
 * the site (their crawler checks every page, not just tool pages).
 *
 * Ads are still only rendered by <AdSlot/>, which lives inside ToolFrame —
 * so ads only appear on /tools/* even though the script is global.
 */
export function AdSenseScript() {
  useEffect(() => {
    if (!CLIENT) return;

    // 1. Verification meta tag
    if (!document.head.querySelector(`meta[name="google-adsense-account"]`)) {
      const meta = document.createElement('meta');
      meta.id = META_ID;
      meta.setAttribute('name', 'google-adsense-account');
      meta.setAttribute('content', CLIENT);
      document.head.appendChild(meta);
    }

    // 2. AdSense library
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
      document.head.appendChild(s);
    }
  }, []);

  return null;
}
