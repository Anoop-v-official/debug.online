/**
 * Single-use, in-memory handoff between a "smart paste" event on the home
 * page and the destination tool. Survives the route navigation (because
 * sessionStorage is per-tab) but is consumed-on-read so values never leak
 * into a second tool open or a copy-pasted URL.
 *
 * We deliberately do NOT use the URL — JWTs and other secrets should never
 * end up in the address bar, browser history, or referrer headers.
 */
const KEY = 'debugdaily:smartpaste';

export function setSmartPaste(slug: string, value: string): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ slug, value, at: Date.now() }));
  } catch {
    /* private mode or quota — silently no-op */
  }
}

/**
 * Read and clear the pending smart-paste IF it targets the requested tool.
 * Returns null if there's nothing pending or it was for a different tool.
 */
export function consumeSmartPaste(slug: string): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { slug?: string; value?: string; at?: number };
    if (data.slug !== slug || typeof data.value !== 'string') return null;
    // Drop anything older than 60s — protects against stale handoffs.
    if (typeof data.at === 'number' && Date.now() - data.at > 60_000) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    sessionStorage.removeItem(KEY);
    return data.value;
  } catch {
    return null;
  }
}
