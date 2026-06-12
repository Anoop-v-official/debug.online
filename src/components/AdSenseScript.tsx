import { useEffect, useState } from 'react';
import { getConsent, subscribeConsent } from '../lib/consent';

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
const SCRIPT_ID = 'adsbygoogle-js';
const META_ID = 'adsense-verify';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Loads the Google AdSense script + verification meta tag site-wide.
 *
 * The verification meta tag is always present so AdSense's reviewer crawler
 * can verify site ownership on every page. The actual JS library that loads
 * ads is only inserted AFTER the user grants consent — until then, no
 * third-party cookies are set and no ad requests are made.
 */
export function AdSenseScript() {
  const [consent, setConsentState] = useState(getConsent());

  useEffect(() => {
    return subscribeConsent(setConsentState);
  }, []);

  useEffect(() => {
    if (!CLIENT) return;
    if (document.head.querySelector('meta[name="google-adsense-account"]')) return;
    const meta = document.createElement('meta');
    meta.id = META_ID;
    meta.setAttribute('name', 'google-adsense-account');
    meta.setAttribute('content', CLIENT);
    document.head.appendChild(meta);
  }, []);

  useEffect(() => {
    if (!CLIENT) return;
    if (consent !== 'granted') return;
    if (document.getElementById(SCRIPT_ID)) return;

    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
    document.head.appendChild(s);
  }, [consent]);

  return null;
}
