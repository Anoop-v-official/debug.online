import { isTauri } from './runtime';
import { sniff, type SniffResult } from './sniff';

/**
 * In the Tauri desktop build, read the system clipboard and run our sniff
 * detector against it. Returns null in the browser (we never auto-read the
 * clipboard there — it's a privacy footgun and triggers permission prompts).
 *
 * Backwards-compatible alias kept: returns { kind, value } where kind is
 * the tool slug, matching the pre-refactor shape in App.tsx.
 */
export async function sniffClipboard(): Promise<{ kind: string; value: string } | null> {
  if (!isTauri) return null;
  try {
    const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
    const text = await readText();
    if (!text) return null;
    const result: SniffResult | null = sniff(text);
    if (!result) return null;
    return { kind: result.slug, value: result.value };
  } catch {
    return null;
  }
}
