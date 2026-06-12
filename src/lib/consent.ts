// Lightweight consent layer.
//
// Three states:
//   "pending"  — user has not chosen yet (default before banner is dismissed)
//   "granted"  — user accepted analytics + ads
//   "denied"   — user declined; essential features only
//
// We persist the choice in localStorage. Components that need to gate behind
// consent (AdSense script, analytics tracker) subscribe to changes.

const KEY = 'debugdaily.consent';

export type ConsentState = 'pending' | 'granted' | 'denied';

const listeners = new Set<(s: ConsentState) => void>();

function read(): ConsentState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'granted' || raw === 'denied') return raw;
  } catch {
    /* private mode etc. */
  }
  return 'pending';
}

export function getConsent(): ConsentState {
  return read();
}

export function setConsent(state: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(KEY, state);
  } catch {
    /* ignore */
  }
  for (const cb of listeners) cb(state);
}

export function subscribeConsent(cb: (s: ConsentState) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Convenience: returns true when ads / non-essential analytics may run.
export function hasFullConsent(): boolean {
  return read() === 'granted';
}
