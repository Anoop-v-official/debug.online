import { isTauri } from './runtime';

// In the browser, /api/* is served by Vercel from the same origin (relative URL).
// In the Tauri app, the webview's origin is tauri://localhost — so we point at
// the deployed backend. Override with VITE_API_BASE if you self-host.
const FALLBACK = 'https://debugdaily.online';
const ENV_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

export const API_BASE = isTauri ? ENV_BASE || FALLBACK : '';

export function api(path: string): string {
  return API_BASE + path;
}
