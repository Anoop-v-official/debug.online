// Tiny helper: turn a 2-letter ISO 3166 country code into a flag emoji
// (browsers render regional-indicator code points as the flag for the
// matching country) and a human-readable name.

export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🏳️';
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (code.toUpperCase().charCodeAt(0) - 65),
    A + (code.toUpperCase().charCodeAt(1) - 65),
  );
}

// Resolves a country code to a display name in the user's locale. Uses the
// browser-native Intl.DisplayNames where available; falls back to the bare code.
const cache: Record<string, string> = {};
function displayNamesProvider(): { of: (code: string) => string | undefined } | null {
  try {
    if (typeof Intl !== 'undefined' && 'DisplayNames' in Intl) {
      return new (Intl as unknown as {
        DisplayNames: new (
          locales: string[],
          opts: { type: 'region' },
        ) => { of: (code: string) => string | undefined };
      }).DisplayNames(['en'], { type: 'region' });
    }
  } catch {
    /* fall through */
  }
  return null;
}
const provider = displayNamesProvider();

export function countryName(code: string): string {
  const upper = code.toUpperCase();
  if (cache[upper]) return cache[upper];
  const name = provider?.of(upper) ?? upper;
  cache[upper] = name;
  return name;
}
