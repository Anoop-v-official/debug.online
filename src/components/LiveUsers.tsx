import { useEffect, useState } from 'react';

const HEARTBEAT_MS = 25_000;
const SID_KEY = 'debugdaily.sid';

function getSid(): string {
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().replace(/-/g, '')
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    // sessionStorage can throw in privacy modes — fall back to a per-tab id.
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export function LiveUsers() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sid = getSid();
    const ctrl = new AbortController();

    async function beat() {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sid }),
          signal: ctrl.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === 'number') {
          setCount(data.count);
        }
      } catch {
        // Network error — leave existing count alone.
      }
    }

    beat();
    const id = window.setInterval(beat, HEARTBEAT_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') beat();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`${count} ${count === 1 ? 'user' : 'users'} online`}
      title={`${count} ${count === 1 ? 'user' : 'users'} online`}
      className="hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-border bg-surface text-xs text-muted"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="tabular-nums text-text">{count}</span>
      <span>live</span>
    </span>
  );
}
