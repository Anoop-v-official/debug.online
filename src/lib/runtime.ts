// Detect whether we're running inside the Tauri shell or the browser.
// Tauri injects __TAURI_INTERNALS__ on window before any frontend code runs.

interface TauriInternals {
  invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: TauriInternals;
  }
}

export const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!window.__TAURI_INTERNALS__) {
    throw new Error('invoke called outside Tauri runtime');
  }
  return window.__TAURI_INTERNALS__.invoke<T>(cmd, args);
}
