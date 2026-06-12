import { hasFullConsent } from './consent';

// In-session dedupe so a user typing 'graphqlllll' doesn't fire one beat per
// keystroke. We only report after the query has stayed unmatched for a beat.
const reported = new Set<string>();
let timer: number | null = null;

export function reportSearchMiss(query: string): void {
  if (!hasFullConsent()) return;
  const q = query.trim().toLowerCase();
  if (q.length < 3) return;
  if (reported.has(q)) return;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    reported.add(q);
    try {
      if ('sendBeacon' in navigator) {
        const blob = new Blob(
          [JSON.stringify({ kind: 'search-miss', query: q })],
          { type: 'application/json' },
        );
        navigator.sendBeacon('/api/metrics', blob);
        return;
      }
    } catch {
      /* fall through */
    }
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'search-miss', query: q }),
      keepalive: true,
    }).catch(() => {
      /* swallow */
    });
  }, 1200);
}
