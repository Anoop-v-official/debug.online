import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export type Category =
  | 'encode'
  | 'format'
  | 'inspect'
  | 'generate'
  | 'network'
  | 'convert';

export interface ToolContent {
  about: string;
  useCases: string[];
  gotchas?: string[];
}

export interface ToolSeo {
  title: string;
  description: string;
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: Category;
  keywords: string[];
  Component: LazyExoticComponent<ComponentType>;
  seo: ToolSeo;
  content: ToolContent;
}

export const categoryLabels: Record<Category, string> = {
  encode: 'Encode',
  format: 'Format',
  inspect: 'Inspect',
  generate: 'Generate',
  network: 'Network',
  convert: 'Convert',
};

export const tools: Tool[] = [
  {
    slug: 'json-format',
    name: 'JSON Formatter',
    description: 'Pretty-print, minify and validate JSON.',
    category: 'format',
    keywords: ['json', 'pretty', 'minify', 'validate', 'parse'],
    Component: lazy(() => import('../tools/json-format')),
    seo: {
      title: 'JSON Formatter, Validator & Minifier — Free Online',
      description:
        'Format, validate and minify JSON instantly in your browser. Catches syntax errors, supports 2/4-space indents and one-line minified output. No data leaves your machine.',
    },
    content: {
      about:
        'Pretty-prints JSON for humans, minifies it for transport, and tells you exactly where syntax breaks. Runs entirely in your browser — your payload is never uploaded.',
      useCases: [
        'Pasting an API response from your terminal to read it without squinting.',
        'Shrinking a config file before embedding it in a query string or env var.',
        'Confirming that a string really is valid JSON before passing it downstream.',
      ],
      gotchas: [
        'Standard JSON forbids comments and trailing commas — both will fail to parse here on purpose.',
        'JavaScript numbers lose precision past 2^53, so very large IDs may be silently rounded if you re-stringify.',
      ],
    },
  },
  {
    slug: 'jwt-decode',
    name: 'JWT Decoder',
    description: 'Inspect header and payload of a JSON Web Token.',
    category: 'inspect',
    keywords: ['jwt', 'token', 'jose', 'auth', 'decode'],
    Component: lazy(() => import('../tools/jwt-decode')),
    seo: {
      title: 'JWT Decoder — Inspect Header, Payload & Expiry',
      description:
        'Decode any JSON Web Token to see its header and payload, plus a human-readable expiry. Decoding only — signatures are never sent anywhere.',
    },
    content: {
      about:
        'Splits a JWT on its dots, base64url-decodes the header and payload, and parses both as JSON. Highlights how long is left on the `exp` claim.',
      useCases: [
        'Debugging an auth flow when the API rejects your token with no detail.',
        'Confirming which claims your identity provider is actually sending.',
        'Spotting a token with an `alg: none` header before it bites you in production.',
      ],
      gotchas: [
        'Decoding is NOT verification. Anything in the payload should be treated as untrusted until your server verifies the signature.',
        'A token can be perfectly valid here but rejected by your API because of `aud`, `iss` or clock skew.',
      ],
    },
  },
  {
    slug: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64, Unicode-safe.',
    category: 'encode',
    keywords: ['base64', 'encode', 'decode', 'b64'],
    Component: lazy(() => import('../tools/base64')),
    seo: {
      title: 'Base64 Encoder / Decoder (UTF-8 safe) — Free Online',
      description:
        'Encode any text to Base64 or decode it back, with full UTF-8 support so emoji and non-Latin characters round-trip correctly. Runs locally in your browser.',
    },
    content: {
      about:
        'Converts arbitrary text to Base64 and back. Uses TextEncoder/TextDecoder so emoji, accents and non-Latin scripts all survive the round-trip.',
      useCases: [
        'Embedding a small image or config blob into a JSON or YAML file.',
        'Inspecting a `Authorization: Basic ...` header to recover the username/password pair.',
        'Reading the payload of a JWT segment by hand.',
      ],
      gotchas: [
        'Base64url (used in JWTs) replaces `+/=` with `-_` and is NOT directly compatible. Convert before pasting if needed.',
        'Plain `btoa()` breaks on non-Latin-1 input — that\'s why this tool uses TextEncoder under the hood.',
      ],
    },
  },
  {
    slug: 'url-encode',
    name: 'URL Encode/Decode',
    description: 'Percent-encode and decode strings for URLs.',
    category: 'encode',
    keywords: ['url', 'percent', 'encode', 'decode', 'uri'],
    Component: lazy(() => import('../tools/url-encode')),
    seo: {
      title: 'URL Encoder / Decoder — Percent-Encoding Online',
      description:
        'Percent-encode any string for safe inclusion in a URL, or decode an encoded URL back to readable text. Handles spaces, ampersands and Unicode correctly.',
    },
    content: {
      about:
        'Wraps `encodeURIComponent` / `decodeURIComponent` with a friendly UI. Encoding makes a string safe to paste into a query parameter; decoding reverses it.',
      useCases: [
        'Building a deeplink that contains another URL as a parameter.',
        'Reading a callback URL out of an OAuth redirect.',
        'Cleaning up a URL that was double-encoded by an over-eager framework.',
      ],
      gotchas: [
        '`encodeURIComponent` and `encodeURI` are different — the latter leaves `&`, `?`, `#` alone. This tool uses `encodeURIComponent`, which is what you want for query values.',
        'Decoding a string that was never encoded usually still works, but malformed `%` sequences will throw.',
      ],
    },
  },
  {
    slug: 'html-encode',
    name: 'HTML Entities',
    description: 'Encode and decode HTML entities.',
    category: 'encode',
    keywords: ['html', 'entities', 'encode', 'decode', 'escape'],
    Component: lazy(() => import('../tools/html-encode')),
    seo: {
      title: 'HTML Entity Encoder / Decoder — Online & Free',
      description:
        'Escape HTML special characters (& < > " \') to their entity form, or decode entities back to plain text. Browser-native, no upload.',
    },
    content: {
      about:
        'Converts the five HTML-significant characters into their entity equivalents, and decodes any entities (named or numeric) back to text using the browser\'s own parser.',
      useCases: [
        'Pasting code into a blog post or doc without breaking the page layout.',
        'Sanity-checking output from a CMS that may have double-encoded user input.',
        'Generating safe-to-render text for an HTML email template.',
      ],
      gotchas: [
        'Encoding alone is not XSS protection — context matters (attribute, JS string, URL).',
        'Decoding uses the live DOM, so script tags in the input will not execute but odd whitespace might be normalized.',
      ],
    },
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test JavaScript regular expressions live.',
    category: 'inspect',
    keywords: ['regex', 'regexp', 'pattern', 'match'],
    Component: lazy(() => import('../tools/regex-tester')),
    seo: {
      title: 'Regex Tester — Live JavaScript RegExp Online',
      description:
        'Test JavaScript regular expressions live against any sample text. See every match, capture group and offset as you type. Supports g, i, m, s, u flags.',
    },
    content: {
      about:
        'Compiles your pattern with the chosen flags and runs it against your sample text on every keystroke. Shows the full match, every capture group, and the index where each match starts.',
      useCases: [
        'Crafting a pattern for log-line parsing before pasting it into your code.',
        'Debugging why a validation regex matches more (or less) than you expected.',
        'Quickly extracting one piece of data from a wall of text without writing a script.',
      ],
      gotchas: [
        'This is a JavaScript `RegExp` — PCRE features like lookbehinds beyond ES2018, recursion, or named POSIX classes may not work.',
        'A pattern with the `g` flag is stateful (`lastIndex`); this tool resets it on every run, but your real code might not.',
      ],
    },
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate v4 UUIDs in bulk.',
    category: 'generate',
    keywords: ['uuid', 'guid', 'random', 'id'],
    Component: lazy(() => import('../tools/uuid-generator')),
    seo: {
      title: 'UUID v4 Generator — Bulk, Cryptographically Random',
      description:
        'Generate up to 500 RFC 4122 v4 UUIDs at once, using the browser\'s cryptographically secure random source. Copy all in one click.',
    },
    content: {
      about:
        'Produces version 4 UUIDs (random, not time-based) using `crypto.randomUUID`. Bulk-generates up to 500 at a time with one-click copy of the whole list.',
      useCases: [
        'Seeding a test database with stable IDs.',
        'Quickly generating a request-id or correlation-id for an experiment.',
        'Creating placeholder primary keys for a migration script.',
      ],
      gotchas: [
        'v4 UUIDs are random, not sortable. If you need time-ordering, look at UUIDv7 or ULIDs instead.',
        'Random does not mean unique forever, but the collision probability is negligible at any realistic scale.',
      ],
    },
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'SHA-1, SHA-256, SHA-384, SHA-512 of any input.',
    category: 'generate',
    keywords: ['hash', 'sha', 'sha256', 'digest', 'crypto'],
    Component: lazy(() => import('../tools/hash-generator')),
    seo: {
      title: 'SHA-1 / SHA-256 / SHA-512 Hash Generator — Online',
      description:
        'Compute SHA-1, SHA-256, SHA-384 or SHA-512 hashes of any text. Uses the browser\'s native WebCrypto, so input never leaves your machine.',
    },
    content: {
      about:
        'Hashes arbitrary text using `crypto.subtle.digest`. Output is the lowercase hex digest. All four SHA-2 family sizes plus SHA-1 are available.',
      useCases: [
        'Computing a quick fingerprint for an integrity check.',
        'Verifying a checksum someone published for a release artifact.',
        'Generating a deterministic cache key from a piece of input.',
      ],
      gotchas: [
        'SHA-1 is broken for collision resistance — fine for cache keys, NOT for security signatures.',
        'For password hashing use bcrypt/argon2, not raw SHA. SHA is too fast to brute-force-resist.',
      ],
    },
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB and HSL.',
    category: 'convert',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'css'],
    Component: lazy(() => import('../tools/color-converter')),
    seo: {
      title: 'HEX ↔ RGB ↔ HSL Color Converter — Online',
      description:
        'Convert any CSS color between HEX, RGB and HSL with a live preview. Accepts shorthand hex, rgb(), hsl() and is forgiving of whitespace.',
    },
    content: {
      about:
        'Parses a color in any of the common CSS notations and converts it to all three. Renders a live swatch so you can sanity-check the result.',
      useCases: [
        'Translating a designer\'s HEX into HSL so you can build a tint/shade scale.',
        'Quickly checking what `rgb(0, 255, 136)` looks like.',
        'Normalizing color values between a Figma export and a CSS variable file.',
      ],
      gotchas: [
        'HSL conversion rounds to integer percentages, so a perfect round-trip back to the original RGB is not guaranteed.',
        'Alpha is not currently parsed — the alpha channel of `rgba()`/`hsla()` inputs is ignored.',
      ],
    },
  },
  {
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Unix epoch ↔ human-readable date.',
    category: 'convert',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'iso'],
    Component: lazy(() => import('../tools/timestamp-converter')),
    seo: {
      title: 'Unix Timestamp Converter — Epoch to Date & Back',
      description:
        'Convert Unix seconds, milliseconds or any parseable date string into ISO, UTC, local time and a relative "in X minutes" view. Auto-detects seconds vs milliseconds.',
    },
    content: {
      about:
        'Accepts a Unix timestamp (seconds or milliseconds) or any string `Date` can parse, and shows it in every common format at once, plus a relative "ago / in" view.',
      useCases: [
        'Reading a `created_at` value from a database row that\'s stored as epoch seconds.',
        'Confirming whether a log line is in UTC or your local zone.',
        'Computing how stale a cache entry is at a glance.',
      ],
      gotchas: [
        'Inputs of 10 digits or fewer are treated as seconds; longer inputs are treated as milliseconds. Mixed-precision data needs manual care.',
        'JavaScript `Date` parses some non-ISO strings inconsistently across browsers — prefer ISO 8601 when you control the format.',
      ],
    },
  },
  {
    slug: 'cron-parser',
    name: 'Cron Explainer',
    description: 'Translate cron expressions into plain English.',
    category: 'inspect',
    keywords: ['cron', 'schedule', 'crontab'],
    Component: lazy(() => import('../tools/cron-parser')),
    seo: {
      title: 'Cron Expression Explainer — Plain English Online',
      description:
        'Translate any 5-field cron expression into plain English. Supports lists, ranges, steps and aliases like @daily, @hourly, @weekly.',
    },
    content: {
      about:
        'Reads a standard 5-field cron expression and describes when it fires in plain English. Recognizes shortcuts like `@daily` and translates month/weekday numbers to names.',
      useCases: [
        'Sanity-checking a schedule before committing it to a CI config.',
        'Translating a cron line in a legacy crontab so you can document or change it.',
        'Explaining a deploy schedule to a non-engineer reviewer.',
      ],
      gotchas: [
        'Quartz-style 6- or 7-field cron (with seconds and year) is not supported here — this is the Vixie/POSIX dialect.',
        'A literal `?` is not handled. Leave it as `*` for compatibility with the standard 5-field form.',
      ],
    },
  },
  {
    slug: 'json-to-ts',
    name: 'JSON → TypeScript',
    description: 'Infer TypeScript interfaces from a JSON sample.',
    category: 'convert',
    keywords: ['json', 'typescript', 'interface', 'types'],
    Component: lazy(() => import('../tools/json-to-ts')),
    seo: {
      title: 'JSON to TypeScript Interfaces — Online Generator',
      description:
        'Generate TypeScript interfaces from a sample JSON payload. Infers nested objects, arrays, unions and optional fields. Pure browser, no upload.',
    },
    content: {
      about:
        'Walks a sample JSON value and emits one or more `export interface` declarations, naming nested objects after their key. Arrays of mixed types collapse into a union.',
      useCases: [
        'Bootstrapping types from an API response when there\'s no OpenAPI spec.',
        'Catching schema drift by re-running against a fresh sample and diffing.',
        'Converting a fixture file into a typed import for tests.',
      ],
      gotchas: [
        'Types are inferred from one sample — fields that happen to be `null` will type as `null`, and missing optional fields will not be marked `?`. Treat the output as a starting point.',
        'Identical-looking nested objects get separate interfaces, not deduped. Rename and reuse by hand.',
      ],
    },
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text by words or paragraphs.',
    category: 'generate',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
    Component: lazy(() => import('../tools/lorem-ipsum')),
    seo: {
      title: 'Lorem Ipsum Generator — Words, Sentences, Paragraphs',
      description:
        'Generate any amount of lorem ipsum filler text by word, sentence, or paragraph count. Useful for design mockups, layout testing and form QA.',
    },
    content: {
      about:
        'Generates pseudo-Latin filler text in three granularities. Sentences and paragraphs vary in length so layouts under test don\'t all look identical.',
      useCases: [
        'Filling a Figma → React port with realistic-length copy before real content arrives.',
        'Stress-testing a UI for overflow when paragraphs go long.',
        'Seeding a CMS with sample posts during local development.',
      ],
    },
  },
  {
    slug: 'diff-viewer',
    name: 'Diff Viewer',
    description: 'Side-by-side line diff between two snippets.',
    category: 'inspect',
    keywords: ['diff', 'compare', 'text'],
    Component: lazy(() => import('../tools/diff-viewer')),
    seo: {
      title: 'Text Diff Viewer — Compare Two Snippets Online',
      description:
        'Compare two pieces of text line-by-line with an LCS-based diff. See additions, deletions and unchanged lines side by side.',
    },
    content: {
      about:
        'Computes a longest-common-subsequence diff between two text blobs and renders the unified result with `+`, `-` and unchanged lines.',
      useCases: [
        'Comparing two versions of a config file when you don\'t want to open a git client.',
        'Spotting what changed in a copy-pasted JSON response between two requests.',
        'Reviewing an LLM\'s suggested edit before you apply it.',
      ],
      gotchas: [
        'Diffs are line-based — a single character change in a long line shows the whole line as add+del. For prose, that may be noisy.',
      ],
    },
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Live preview a small Markdown subset.',
    category: 'format',
    keywords: ['markdown', 'md', 'preview'],
    Component: lazy(() => import('../tools/markdown-preview')),
    seo: {
      title: 'Markdown Live Preview — Online & Offline-Friendly',
      description:
        'Type Markdown on the left, see HTML rendered on the right. Supports headings, bold/italic, lists, code blocks and links. Browser-only.',
    },
    content: {
      about:
        'Renders a curated subset of CommonMark (headings, emphasis, code, links, lists) live as you type. No raw HTML and no tables on purpose — keeps the renderer tiny and safe.',
      useCases: [
        'Previewing a README before pushing.',
        'Drafting a comment for a PR or issue without the round-trip.',
        'Quickly turning notes into a styled snippet to paste into a slide.',
      ],
      gotchas: [
        'This is a deliberately limited subset — for full GFM (tables, task lists, footnotes) use a heavier renderer.',
      ],
    },
  },
  {
    slug: 'url-parser',
    name: 'URL Parser',
    description: 'Break a URL into protocol, host, path, query, hash.',
    category: 'inspect',
    keywords: ['url', 'parse', 'query', 'host'],
    Component: lazy(() => import('../tools/url-parser')),
    seo: {
      title: 'URL Parser — Break Down Any URL Online',
      description:
        'Parse any URL into protocol, host, port, path, query parameters and hash. Built on the standard WHATWG URL parser.',
    },
    content: {
      about:
        'Uses the browser\'s native `URL` parser to break a URL into its parts and list every query parameter as a key/value pair.',
      useCases: [
        'Reading a long redirect URL in OAuth flows where parameters are nested and percent-encoded.',
        'Confirming what host an API client is actually hitting after env-variable interpolation.',
        'Auditing a tracking URL to see exactly which parameters are present.',
      ],
      gotchas: [
        'Inputs missing a protocol (e.g. `example.com/foo`) are not valid URLs and will be rejected. Add `https://` if you mean it.',
      ],
    },
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    description: 'camelCase, snake_case, kebab-case, CONSTANT and more.',
    category: 'convert',
    keywords: ['case', 'camel', 'snake', 'kebab', 'pascal'],
    Component: lazy(() => import('../tools/case-converter')),
    seo: {
      title: 'Case Converter — camelCase, snake_case, kebab-case Online',
      description:
        'Convert any phrase between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, sentence case, UPPERCASE and lowercase.',
    },
    content: {
      about:
        'Tokenizes the input on word boundaries (camel humps, dashes, underscores, whitespace) and recomposes it in every common case style.',
      useCases: [
        'Renaming an identifier across languages where conventions differ (e.g. JS camelCase → Python snake_case).',
        'Generating a slug from a human-readable title.',
        'Building constant names from prose for an enum.',
      ],
    },
  },
  {
    slug: 'string-inspector',
    name: 'String Inspector',
    description: 'Length, byte size, line/word counts, codepoints.',
    category: 'inspect',
    keywords: ['string', 'count', 'length', 'bytes'],
    Component: lazy(() => import('../tools/string-inspector')),
    seo: {
      title: 'String Inspector — Char, Byte, Line & Word Count',
      description:
        'Inspect any text: characters, Unicode codepoints, UTF-8 byte size, line and word counts, plus class breakdowns. Useful for size limits and validation.',
    },
    content: {
      about:
        'Computes character count, codepoint count, UTF-8 byte size, and a breakdown by character class (uppercase, lowercase, digits, whitespace).',
      useCases: [
        'Checking whether a tweet, SMS, or push notification fits its length budget.',
        'Spotting why a DB column rejects input — `length` and byte size disagree for emoji.',
        'Validating that a CSV cell only contains expected character classes.',
      ],
      gotchas: [
        '`string.length` counts UTF-16 code units, so a single emoji can count as 2. The "Codepoints" stat is the human-meaningful number.',
      ],
    },
  },
  {
    slug: 'number-base',
    name: 'Number Base',
    description: 'Convert between binary, octal, decimal and hex.',
    category: 'convert',
    keywords: ['binary', 'hex', 'octal', 'decimal', 'base'],
    Component: lazy(() => import('../tools/number-base')),
    seo: {
      title: 'Number Base Converter — Binary, Hex, Octal, Decimal',
      description:
        'Convert any number between binary (0b), octal (0o), decimal and hex (0x). Auto-detects the input base from its prefix.',
    },
    content: {
      about:
        'Parses a number with optional `0x`, `0b`, or `0o` prefix and shows it in all four standard bases. Underscores in the input are ignored.',
      useCases: [
        'Reading a permission mask (`0o755`) without a calculator.',
        'Translating between hex colors and their RGB integer components.',
        'Decoding a bitmask flag from a binary literal.',
      ],
      gotchas: [
        'JavaScript numbers are 64-bit floats — values larger than 2^53 lose precision. Use BigInt-aware tooling for very large hex.',
      ],
    },
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Resolve A, AAAA, MX, TXT, NS records.',
    category: 'network',
    keywords: ['dns', 'lookup', 'resolve', 'mx', 'txt'],
    Component: lazy(() => import('../tools/dns-lookup')),
    seo: {
      title: 'DNS Lookup — A, AAAA, MX, TXT, NS Records Online',
      description:
        'Resolve any DNS record type for a hostname. Backed by Cloudflare and Google resolvers. Handy for debugging email setup, propagation and CDN routing.',
    },
    content: {
      about:
        'Queries the public 1.1.1.1 / 8.8.8.8 resolvers from our server for the record type you choose. Returns each answer with its TTL (and priority for MX).',
      useCases: [
        'Confirming that an SPF or DKIM TXT record is published before mail starts bouncing.',
        'Verifying that a DNS change has propagated past local caches.',
        'Tracing why a domain resolves differently than you expect.',
      ],
      gotchas: [
        'TTLs returned here reflect upstream resolver caching, not your authoritative TTL.',
        'CNAMEs at the apex are illegal per RFC; use ALIAS/ANAME or an A record instead.',
      ],
    },
  },
  {
    slug: 'ssl-check',
    name: 'SSL Check',
    description: 'Inspect a host’s TLS certificate chain and expiry.',
    category: 'network',
    keywords: ['ssl', 'tls', 'certificate', 'cert', 'expiry'],
    Component: lazy(() => import('../tools/ssl-check')),
    seo: {
      title: 'SSL / TLS Certificate Checker — Expiry & SAN Online',
      description:
        'Connect to any HTTPS host and inspect its certificate: subject, issuer, validity window, days remaining and Subject Alternative Names.',
    },
    content: {
      about:
        'Opens a TLS connection to port 443 of the given host and reports the leaf certificate. The "Days left" field is colored — green > 14, yellow under 14, red if expired.',
      useCases: [
        'Setting up a renewal reminder before a cert silently expires on a Sunday.',
        'Confirming a freshly issued cert covers the SANs you asked for.',
        'Spotting a misconfigured load balancer that\'s still serving an old cert.',
      ],
      gotchas: [
        'This checks the leaf, not the full chain trust. A cert can be valid here but rejected by clients with a stricter root store.',
        'SNI is sent — virtual-hosted certificates depend on the hostname matching exactly.',
      ],
    },
  },
  {
    slug: 'user-agent-parser',
    name: 'User-Agent Parser',
    description: 'Identify browser, OS and device from a UA string.',
    category: 'inspect',
    keywords: ['user-agent', 'ua', 'browser', 'os'],
    Component: lazy(() => import('../tools/user-agent-parser')),
    seo: {
      title: 'User-Agent Parser — Browser, OS & Device Detection',
      description:
        'Paste any User-Agent string to see the browser, OS, version and device class it represents. Recognizes Chrome, Firefox, Safari, Edge, mobile and bots.',
    },
    content: {
      about:
        'Pattern-matches a UA string against the common browser, OS, and device markers. Defaults to your own UA so you can verify what your browser is sending.',
      useCases: [
        'Debugging an analytics dashboard that misclassifies visitors.',
        'Reviewing a server log line where the UA looks suspicious.',
        'Confirming that a feature flag based on UA is firing correctly.',
      ],
      gotchas: [
        'UA strings lie all the time — many browsers spoof "Chrome" or "Safari" for compatibility. Treat the result as a hint, not ground truth.',
        'Modern Chromium reports a low-entropy UA by default; rich data needs UA-CH client hints instead.',
      ],
    },
  },
  {
    slug: 'http-status',
    name: 'HTTP Status Codes',
    description: 'Search and explain HTTP status codes.',
    category: 'inspect',
    keywords: ['http', 'status', 'code', 'rfc'],
    Component: lazy(() => import('../tools/http-status')),
    seo: {
      title: 'HTTP Status Codes — Search & Explanations Online',
      description:
        'Search every common HTTP status code (100–505) by number, name or meaning. Explanations are short, plain English, and link the class (success, redirect, client, server).',
    },
    content: {
      about:
        'Browsable, searchable list of every HTTP status code your API is likely to emit, with a one-line explanation and a class label.',
      useCases: [
        'Settling a debate on whether to return 401 or 403.',
        'Documenting an API contract with the right code per failure mode.',
        'Looking up an unfamiliar code from a server log.',
      ],
    },
  },
];

export const toolBySlug: Record<string, Tool> = Object.fromEntries(
  tools.map((t) => [t.slug, t]),
);
