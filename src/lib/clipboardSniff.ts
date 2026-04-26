import { invoke, isTauri } from './runtime';

export interface SniffResult {
  kind: string;
  value: string;
}

export async function sniffClipboard(): Promise<SniffResult | null> {
  if (!isTauri) return null;
  try {
    const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
    const text = await readText();
    if (!text) return null;
    const result = await invoke<SniffResult | null>('sniff_current_clipboard', {
      text,
    });
    return result ?? null;
  } catch {
    return null;
  }
}
