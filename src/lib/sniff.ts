export interface SniffResult {
  /** Tool slug to navigate to. Must match a real tool in src/lib/tools.ts. */
  slug: string;
  /** Human-readable label for the detected type, e.g. "JWT", "hex color". */
  label: string;
  /** The value to pre-fill the destination tool with. */
  value: string;
}

/**
 * Inspect a pasted/typed string and decide which tool — if any — should
 * handle it. Pure function, no side effects. Used by:
 *  - the home page search input (web)
 *  - the Tauri clipboard auto-detect on app focus
 *
 * Order matters: more-specific patterns first, fallbacks last.
 */
export function sniff(raw: string): SniffResult | null {
  const s = raw.trim();
  if (!s || s.length > 16384) return null;
  if (/\s/.test(s) && !s.startsWith('{') && !s.startsWith('[')) {
    // Anything with internal whitespace that isn't JSON is not auto-routable.
    return null;
  }

  // JWT — three base64url-encoded segments separated by dots.
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(s)) {
    return { slug: 'jwt-decode', label: 'JWT', value: s };
  }

  // Hex color — 3, 6, or 8 hex digits, optional leading #.
  if (/^#?[0-9a-fA-F]{3}$/.test(s) || /^#?[0-9a-fA-F]{6}$/.test(s) || /^#?[0-9a-fA-F]{8}$/.test(s)) {
    return { slug: 'color-converter', label: 'hex color', value: s };
  }

  // Unix timestamp — exactly 10 (seconds) or 13 (ms) digits.
  if (/^\d{10}$/.test(s) || /^\d{13}$/.test(s)) {
    return { slug: 'timestamp-converter', label: 'Unix timestamp', value: s };
  }

  // Full URL with protocol.
  if (/^https?:\/\/[^\s]+$/i.test(s)) {
    return { slug: 'url-parser', label: 'URL', value: s };
  }

  // IPv4 dotted-decimal.
  const ipMatch = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (ipMatch) {
    const ok = ipMatch.slice(1).every((o) => {
      const n = Number(o);
      return n >= 0 && n <= 255;
    });
    if (ok) {
      return { slug: 'ip-lookup', label: 'IPv4 address', value: s };
    }
  }

  // Bare hostname (no protocol). Must contain a dot, valid label characters.
  if (
    s.length >= 4 &&
    s.length <= 253 &&
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(s)
  ) {
    return { slug: 'dns-lookup', label: 'domain', value: s };
  }

  // JSON — must be a parseable object or array.
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try {
      JSON.parse(s);
      return { slug: 'json-format', label: 'JSON', value: s };
    } catch {
      /* not valid JSON, fall through */
    }
  }

  return null;
}
