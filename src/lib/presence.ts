import { useEffect, useState } from 'react';
import { hasFullConsent, subscribeConsent } from './consent';

const HEARTBEAT_MS = 25_000;
const SID_KEY = 'debugdaily.sid';

export interface PresenceState {
  count: number;
  total: number;
  ready: boolean; // true once the first heartbeat resolves
}

let state: PresenceState = { count: 0, total: 0, ready: false };
const listeners = new Set<(s: PresenceState) => void>();
let started = false;
let timer: number | null = null;
let sid: string | null = null;

function getSid(): string {
  if (sid) return sid;
  try {
    let s = sessionStorage.getItem(SID_KEY);
    if (!s) {
      s =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().replace(/-/g, '')
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, s);
    }
    sid = s;
  } catch {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return sid;
}

function publish(next: Partial<PresenceState>) {
  state = { ...state, ...next };
  for (const cb of listeners) cb(state);
}

async function beat() {
  try {
    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'presence', sid: getSid() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { count?: number; total?: number };
    publish({
      count: typeof data.count === 'number' ? data.count : state.count,
      total: typeof data.total === 'number' ? data.total : state.total,
      ready: true,
    });
  } catch {
    // Network blip — keep prior values.
  }
}

function start() {
  if (started || typeof window === 'undefined') return;
  // Honor consent: heartbeats touch /api/metrics which records the sid in KV.
  // Don't fire until consent is granted. Resume automatically when granted.
  if (!hasFullConsent()) {
    const unsub = subscribeConsent((s) => {
      if (s === 'granted') {
        unsub();
        start();
      }
    });
    return;
  }
  started = true;
  beat();
  timer = window.setInterval(beat, HEARTBEAT_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') beat();
  });
}

export function usePresence(): PresenceState {
  const [snapshot, setSnapshot] = useState<PresenceState>(state);
  useEffect(() => {
    start();
    listeners.add(setSnapshot);
    setSnapshot(state); // sync if heartbeats already ran
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);
  return snapshot;
}
