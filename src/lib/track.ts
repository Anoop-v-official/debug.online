import { hasFullConsent } from './consent';

const SESSION_KEY = 'debugdaily.tracked';
const SLUG_RE = /^[a-z0-9-]{2,64}$/;

function readTracked(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((v): v is string => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function writeTracked(set: Set<string>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch {
    /* private mode; ignore */
  }
}

export function trackToolOpen(slug: string): void {
  if (!SLUG_RE.test(slug)) return;
  // Honor consent — tool tracking is non-essential aggregate analytics.
  if (!hasFullConsent()) return;
  const tracked = readTracked();
  if (tracked.has(slug)) return;
  tracked.add(slug);
  writeTracked(tracked);

  // Fire-and-forget. Use sendBeacon when available so the request survives
  // a navigation away; otherwise fall back to fetch with keepalive.
  const url = '/api/metrics';
  const body = JSON.stringify({ kind: 'track', slug });
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    /* fall through */
  }
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    /* ignore — analytics must not break the page */
  });
}
