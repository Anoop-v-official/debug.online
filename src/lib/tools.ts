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
  {
    slug: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong passwords or passphrases entirely in your browser.',
    category: 'generate',
    keywords: ['password', 'passphrase', 'random', 'secure', 'strong', 'generator'],
    Component: lazy(() => import('../tools/password-generator')),
    seo: {
      title: 'Strong Password & Passphrase Generator — Online, 100% Client-Side',
      description:
        'Generate cryptographically random passwords or readable passphrases. Custom length, character classes, similar-character exclusion. Runs entirely in your browser.',
    },
    content: {
      about:
        'Uses crypto.getRandomValues for true randomness. Switch between random character passwords and human-readable passphrases. The strength meter rates the result by entropy, not just length.',
      useCases: [
        'Spinning up a new admin account where you need a secret you won\'t reuse.',
        'Generating a memorable passphrase for SSH key encryption or a 1Password vault.',
        'Producing a non-rotatable secret for an internal service or a CI runner.',
      ],
      gotchas: [
        'Length matters more than complexity. A 20-character random string already exceeds most attack budgets.',
        'Don\'t reuse generated values across services — that defeats the point of generating them.',
      ],
    },
  },
  {
    slug: 'css-unit-converter',
    name: 'CSS Unit Converter',
    description: 'Convert px, rem, em, pt, vw, vh and % with full context.',
    category: 'convert',
    keywords: ['css', 'px', 'rem', 'em', 'vh', 'vw', 'unit', 'convert'],
    Component: lazy(() => import('../tools/css-unit-converter')),
    seo: {
      title: 'CSS Unit Converter — px to rem, em, vh, vw, % Online',
      description:
        'Convert any CSS unit to all common alternatives at once. Configurable root and parent font size, plus viewport width and height. Live, accurate, no surprises.',
    },
    content: {
      about:
        'Takes a value in any common CSS unit and shows it in every other one, given your root font size, parent font size, and viewport dimensions. Great for translating designer specs into responsive code.',
      useCases: [
        'Translating Figma px values into rem so they scale with the user\'s preferred font size.',
        'Working out the vw equivalent of a fixed pixel breakpoint.',
        'Converting print-style pt values to web px.',
      ],
      gotchas: [
        'em depends on the *parent* element\'s font size, not the root. The Parent input here is your assumption.',
        'vw and vh depend on the actual viewport at render time. The values you pick here are a snapshot.',
      ],
    },
  },
  {
    slug: 'cidr-calculator',
    name: 'CIDR / Subnet Calculator',
    description: 'Break a CIDR block into network, broadcast, mask and usable hosts.',
    category: 'network',
    keywords: ['cidr', 'subnet', 'ipv4', 'mask', 'network', 'broadcast', 'aws', 'vpc'],
    Component: lazy(() => import('../tools/cidr-calculator')),
    seo: {
      title: 'CIDR / Subnet Calculator — IPv4 Online',
      description:
        'Enter any IPv4 CIDR block and see the network address, broadcast, netmask, wildcard, first/last usable IP, and total host count. AWS VPC friendly.',
    },
    content: {
      about:
        'Pure-bitmath calculator for IPv4 CIDR blocks. Tells you exactly which addresses live inside the block, the netmask in dotted-decimal, and the wildcard (inverse mask) used by some firewall rules.',
      useCases: [
        'Picking a non-overlapping VPC CIDR before you create the AWS subnets.',
        'Sanity-checking a /29 you\'re about to assign to a router.',
        'Translating between dotted netmask (255.255.255.0) and slash form (/24).',
      ],
      gotchas: [
        '/31 and /32 are special — there is no broadcast/network in the usual sense, so usable host count == total.',
        'IPv6 calculations need a different tool — this is IPv4 only.',
      ],
    },
  },
  {
    slug: 'env-diff',
    name: '.ENV File Diff',
    description: 'Compare two .env files: missing keys, changed values, extras.',
    category: 'inspect',
    keywords: ['env', 'dotenv', 'diff', 'compare', 'environment', 'variables'],
    Component: lazy(() => import('../tools/env-diff')),
    seo: {
      title: '.ENV File Diff & Validator — Compare Environment Variables Online',
      description:
        'Paste two .env files; instantly see missing keys, changed values, and extras between A and B. Catches deploy-time env drift before it hits production.',
    },
    content: {
      about:
        'Parses both pasted .env blobs (handling quoted values and comments) and groups every key into one of four buckets: missing in B, added in B, changed value, or identical. Pure browser comparison — your env never leaves your machine.',
      useCases: [
        'Confirming staging and production envs match before a release.',
        'Diffing a teammate\'s `.env.example` against your `.env.local` to spot keys you forgot to add.',
        'Auditing a leaked .env to see what\'s extra compared to the one in version control.',
      ],
    },
  },
  {
    slug: 'gradient-generator',
    name: 'CSS Gradient Generator',
    description: 'Build linear, radial and conic gradients visually.',
    category: 'generate',
    keywords: ['gradient', 'css', 'linear', 'radial', 'conic', 'background'],
    Component: lazy(() => import('../tools/gradient-generator')),
    seo: {
      title: 'CSS Gradient Generator — Linear, Radial & Conic Online',
      description:
        'Visual builder for CSS gradients with unlimited stops, angle control, and live preview. Copies clean modern CSS for linear-, radial-, and conic-gradient.',
    },
    content: {
      about:
        'Drag stops, pick colors, change direction; the CSS string updates live. Add as many color stops as the design needs and pick from a small set of presets to start.',
      useCases: [
        'Crafting a hero background that doesn\'t scream "gradient generator".',
        'Iterating on a button hover-state background without leaving the browser.',
        'Producing a quick conic gradient for a loading spinner.',
      ],
      gotchas: [
        'Conic gradients aren\'t supported in older browsers — check your target matrix before relying on them.',
      ],
    },
  },
  {
    slug: 'shadow-generator',
    name: 'Box & Text Shadow Generator',
    description: 'Multi-layer box-shadow and text-shadow with live preview.',
    category: 'generate',
    keywords: ['shadow', 'box-shadow', 'text-shadow', 'css', 'tailwind'],
    Component: lazy(() => import('../tools/shadow-generator')),
    seo: {
      title: 'Box Shadow & Text Shadow Generator — CSS Online',
      description:
        'Stack multiple shadow layers, tweak x/y/blur/spread/color independently, and see a live preview. Outputs clean CSS for box-shadow or text-shadow.',
    },
    content: {
      about:
        'Builds CSS shadows visually with full multi-layer support. Each layer has its own offset, blur, spread, color, and inset toggle. Switch between box-shadow and text-shadow modes without losing your layers.',
      useCases: [
        'Designing a soft, layered card shadow that looks better than a single rgba blur.',
        'Faking an inset glow by combining a positive and a negative spread.',
        'Generating a vintage text-shadow stack for a hero headline.',
      ],
      gotchas: [
        'Each shadow layer is rendered, so 6+ layers can become expensive on low-end mobile.',
        'spread is not available for text-shadow — only box-shadow.',
      ],
    },
  },
  {
    slug: 'contrast-checker',
    name: 'Color Contrast Checker',
    description: 'Check WCAG 2.1 AA/AAA contrast ratios with live preview.',
    category: 'inspect',
    keywords: ['contrast', 'wcag', 'a11y', 'accessibility', 'color', 'ratio'],
    Component: lazy(() => import('../tools/contrast-checker')),
    seo: {
      title: 'Color Contrast Checker — WCAG 2.1 AA / AAA Online',
      description:
        'Pass a foreground and background color; see the contrast ratio, AA and AAA verdicts for both body and large text, and a live preview. Built on the standard relative-luminance formula.',
    },
    content: {
      about:
        'Computes the WCAG 2.1 contrast ratio between two colors using the standard relative-luminance formula. Shows pass/fail for AA (4.5:1 body, 3:1 large) and AAA (7:1 body, 4.5:1 large).',
      useCases: [
        'Verifying a brand color combo meets accessibility guidelines before shipping a redesign.',
        'Auditing a button\'s focus state contrast.',
        'Picking which of several "muted" text colors meets AA against your background.',
      ],
      gotchas: [
        'WCAG 2.1 contrast doesn\'t account for font weight or anti-aliasing — designs that look low-contrast may technically pass, and vice versa.',
        'For users with limited vision, AAA is the safer bar for body text.',
      ],
    },
  },
  {
    slug: 'image-to-base64',
    name: 'Image to Base64',
    description: 'Convert any image to a Base64 data URL ready for HTML or CSS.',
    category: 'convert',
    keywords: ['image', 'base64', 'data-url', 'png', 'jpg', 'svg', 'webp', 'embed'],
    Component: lazy(() => import('../tools/image-to-base64')),
    seo: {
      title: 'Image to Base64 Data URL Converter — Online',
      description:
        'Drop a PNG, JPG, SVG, GIF or WebP and get a Base64 data URL ready to paste into HTML or CSS. Runs entirely in your browser — files never leave your machine.',
    },
    content: {
      about:
        'Reads any image with the browser\'s FileReader and outputs a Base64 data URL plus ready-to-paste HTML and CSS snippets. Files never leave your device.',
      useCases: [
        'Embedding a small icon directly into HTML to save a request.',
        'Inlining a tiny background image so a cached CSS file is self-contained.',
        'Generating a data URL for a quick demo or codepen.',
      ],
      gotchas: [
        'Base64 inflates size by ~33%. Inline only when the request savings outweigh the bigger payload.',
        'Browsers cap a single data URL\'s size — keep inlined assets well under 10 kB for best practice.',
      ],
    },
  },
  {
    slug: 'svg-optimizer',
    name: 'SVG Optimizer',
    description: 'Strip metadata, comments and editor cruft from SVG markup.',
    category: 'format',
    keywords: ['svg', 'optimize', 'minify', 'compress', 'inkscape', 'figma'],
    Component: lazy(() => import('../tools/svg-optimizer')),
    seo: {
      title: 'SVG Optimizer Online — Strip Metadata, Comments & Editor Cruft',
      description:
        'Paste SVG markup and get a clean, smaller version with comments, doctypes, editor namespaces and generated IDs removed. Side-by-side preview to verify.',
    },
    content: {
      about:
        'Removes the kind of bloat editors like Inkscape, Sketch, and Figma add to exported SVGs: comments, DOCTYPE, vendor namespaces, generated IDs, and overlong decimals. Renders both versions side by side so you can confirm nothing visual changed.',
      useCases: [
        'Slimming an icon set before bundling into an app.',
        'Cleaning a designer-handed-off SVG before pasting it into a JSX component.',
        'Quick preview of what\'s actually inside an SVG you got from the internet.',
      ],
      gotchas: [
        'For path-level optimization (rounding coords, merging paths), use SVGO. This is a fast in-browser textual cleanup.',
      ],
    },
  },
  {
    slug: 'yaml-validator',
    name: 'YAML Validator',
    description: 'Validate YAML and round-trip it to JSON.',
    category: 'format',
    keywords: ['yaml', 'kubernetes', 'k8s', 'docker-compose', 'validate', 'json'],
    Component: lazy(() => import('../tools/yaml-validator')),
    seo: {
      title: 'YAML Validator & YAML ↔ JSON Converter — Online',
      description:
        'Paste YAML, get instant validation with line-aware errors. Convert to JSON or re-format clean YAML. Perfect for Kubernetes manifests and Docker Compose files.',
    },
    content: {
      about:
        'Backed by js-yaml, the same parser used in many Node tools. Errors include line and column numbers so you can jump straight to the broken indentation.',
      useCases: [
        'Spotting why your Kubernetes manifest fails to apply because of a tab character.',
        'Converting a YAML config to JSON for a script that doesn\'t parse YAML.',
        'Re-flowing hand-edited YAML to canonical form before committing.',
      ],
      gotchas: [
        'YAML 1.2 is followed strictly — "yes/no/on/off" parse as booleans only in 1.1 mode.',
        'Anchors and merge keys (<<) are supported, but not all downstream YAML consumers are.',
      ],
    },
  },
  {
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format messy SQL across MySQL, Postgres, MSSQL and more.',
    category: 'format',
    keywords: ['sql', 'format', 'mysql', 'postgresql', 'tsql', 'snowflake', 'bigquery'],
    Component: lazy(() => import('../tools/sql-formatter')),
    seo: {
      title: 'SQL Formatter Online — MySQL, Postgres, MSSQL, Snowflake, BigQuery',
      description:
        'Paste a one-line query, get clean indented SQL. Pick your dialect, tab width, and keyword case. Powered by sql-formatter — no upload, all in your browser.',
    },
    content: {
      about:
        'Wraps the open-source sql-formatter library so you can format SQL across nine dialects without installing anything. Pick the dialect that matches your warehouse to keep dialect-specific keywords (e.g. PostgreSQL\'s WINDOW, BigQuery\'s STRUCT) intact.',
      useCases: [
        'Reading a one-line query pulled from a log into something a human can review.',
        'Cleaning up a query before pasting it into a PR or doc.',
        'Normalizing case in legacy SQL where someone wrote `SELECT` and `select` in the same file.',
      ],
      gotchas: [
        'Dialect choice matters — the wrong one can mis-tokenize a keyword or quote.',
        'Comments are preserved verbatim, including their position relative to surrounding tokens.',
      ],
    },
  },
  {
    slug: 'bcrypt-tester',
    name: 'Bcrypt Hash Tester',
    description: 'Generate or verify bcrypt password hashes in your browser.',
    category: 'generate',
    keywords: ['bcrypt', 'hash', 'password', 'verify', 'salt', 'cost'],
    Component: lazy(() => import('../tools/bcrypt-tester')),
    seo: {
      title: 'Bcrypt Hash Generator & Verifier — Online, Client-Side',
      description:
        'Generate a bcrypt hash for any password or verify a password against an existing hash. Choose the cost factor. Runs entirely in your browser via bcryptjs.',
    },
    content: {
      about:
        'Generates bcrypt hashes with a chosen cost factor (4–14) using bcryptjs in WebAssembly. Verify mode lets you confirm a password matches an existing `$2a$…` hash without sending either to a server.',
      useCases: [
        'Setting up a seed user in a fresh database — paste the generated hash directly.',
        'Debugging a login flow where a hash from one library doesn\'t verify in another.',
        'Picking a cost factor for production by feeling how long each step actually takes in your environment.',
      ],
      gotchas: [
        'Bcrypt truncates at 72 bytes. Long passphrases get silently shortened.',
        'Browser bcrypt is slower than native — production cost factor decisions should match the runtime that actually verifies, not the browser.',
      ],
    },
  },
  {
    slug: 'fake-data-generator',
    name: 'Test Data Generator',
    description: 'Generate realistic-looking fake users for testing, JSON or CSV.',
    category: 'generate',
    keywords: ['fake', 'mock', 'test-data', 'seed', 'csv', 'json', 'faker'],
    Component: lazy(() => import('../tools/fake-data-generator')),
    seo: {
      title: 'Test Data Generator — Realistic Fake Names, Emails & Addresses',
      description:
        'Generate up to 500 rows of synthetic but realistic-looking user data. Names, emails, phone numbers, addresses, IPs. Export as JSON or CSV.',
    },
    content: {
      about:
        'Produces realistic-but-synthetic user records for seeding databases, demoing UI, or load-testing list views. All values are randomly composed — no real people, no real card numbers.',
      useCases: [
        'Seeding a fresh staging database with a few hundred users.',
        'Filling a Storybook table with believable rows.',
        'Generating a CSV to import into a spreadsheet for layout testing.',
      ],
    },
  },
  {
    slug: 'csp-generator',
    name: 'CSP Header Generator',
    description: 'Build a Content Security Policy header directive by directive.',
    category: 'generate',
    keywords: ['csp', 'content-security-policy', 'header', 'xss', 'security'],
    Component: lazy(() => import('../tools/csp-generator')),
    seo: {
      title: 'Content Security Policy (CSP) Header Generator — Online',
      description:
        'Build a CSP header visually. Each directive explained in plain English. Toggle Report-Only and add a report-uri. Outputs a copy-ready header.',
    },
    content: {
      about:
        'Lays out the most common CSP directives with one-line explanations and lets you fill in the allowed source list. Outputs a complete `Content-Security-Policy` (or Report-Only) header you can drop into your server config.',
      useCases: [
        'Bootstrapping a CSP for a new app, starting from a tight default.',
        'Documenting an existing policy in a way reviewers can actually read.',
        'Building a Report-Only policy to deploy first, watch for violations, then enforce.',
      ],
      gotchas: [
        'Avoid `\'unsafe-inline\'` and `\'unsafe-eval\'` in production — they undo most of the CSP value.',
        'Some third-party scripts (analytics, embeds) require specific source allow-lists; check their docs.',
      ],
    },
  },
  {
    slug: 'nginx-generator',
    name: 'Nginx Config Generator',
    description: 'Generate a production-ready Nginx server block for static or proxy use.',
    category: 'generate',
    keywords: ['nginx', 'config', 'reverse-proxy', 'ssl', 'letsencrypt', 'http2'],
    Component: lazy(() => import('../tools/nginx-generator')),
    seo: {
      title: 'Nginx Config Generator — Reverse Proxy, SSL, HTTP/2 Online',
      description:
        'Answer a few questions and get a production-ready Nginx server block: SSL, HTTP/2, HSTS, gzip, security headers, optional rate limiting and HTTP→HTTPS redirect.',
    },
    content: {
      about:
        'Produces a sensible-default Nginx config for either a static SPA root or a reverse-proxied upstream. Includes SSL with Let\'s Encrypt paths, HTTP/2, security headers, gzip, optional rate limiting on `/api/`, and a HTTP→HTTPS redirect server block.',
      useCases: [
        'Spinning up a new VPS deployment without re-googling all the directives.',
        'Generating a starting point that already has the headers a security audit will expect.',
        'Comparing your existing config against a known-good baseline.',
      ],
      gotchas: [
        'The Let\'s Encrypt cert paths assume Certbot defaults — adjust if you use a different ACME client.',
        'Rate limiting is per-IP. Behind a CDN you\'ll want `set_real_ip_from` first.',
      ],
    },
  },
  {
    slug: 'dockerfile-linter',
    name: 'Dockerfile Linter',
    description: 'Spot anti-patterns in a Dockerfile without leaving the browser.',
    category: 'inspect',
    keywords: ['dockerfile', 'docker', 'lint', 'hadolint', 'best-practice'],
    Component: lazy(() => import('../tools/dockerfile-linter')),
    seo: {
      title: 'Dockerfile Linter Online — Spot Anti-patterns Instantly',
      description:
        'Paste a Dockerfile, get a list of issues with line numbers and rule IDs (Hadolint-style). Catches `latest` tags, missing USER, root containers, sudo usage and more.',
    },
    content: {
      about:
        'Scans a pasted Dockerfile against a curated set of common anti-patterns from the Hadolint catalog. Each issue shows a line number, severity, and rule ID so you can look up the rationale.',
      useCases: [
        'Pre-checking a Dockerfile before opening a PR.',
        'Teaching a teammate why their `RUN apt-get install` is broken.',
        'Quick audit of a Dockerfile pulled from a tutorial.',
      ],
      gotchas: [
        'This is a fast in-browser subset of Hadolint. For full coverage and CI gating, run Hadolint properly.',
      ],
    },
  },
  {
    slug: 'email-header-analyzer',
    name: 'Email Header Analyzer',
    description: 'Trace an email\'s routing path and check SPF / DKIM / DMARC.',
    category: 'inspect',
    keywords: ['email', 'header', 'spf', 'dkim', 'dmarc', 'spam', 'phishing'],
    Component: lazy(() => import('../tools/email-header-analyzer')),
    seo: {
      title: 'Email Header Analyzer — SPF, DKIM, DMARC Online',
      description:
        'Paste raw email headers; see the SPF, DKIM, and DMARC verdicts, full Received hop chain, and key headers. Detect spoofing and trace where a message came from.',
    },
    content: {
      about:
        'Parses raw email headers (the kind you get from Gmail\'s "Show original") and surfaces the three things that matter most: authentication results (SPF/DKIM/DMARC), the routing path, and the standard envelope fields.',
      useCases: [
        'Investigating whether a suspicious email is real or phished.',
        'Debugging why your transactional mail is failing DMARC at one provider.',
        'Tracing how long a message sat at each hop on its way to the inbox.',
      ],
      gotchas: [
        'Authentication-Results comes from the receiving server\'s POV. A "pass" here only means the receiver checked and was satisfied.',
      ],
    },
  },
  {
    slug: 'ssh-keygen',
    name: 'SSH Key Generator',
    description: 'Generate an RSA SSH key pair entirely in your browser.',
    category: 'generate',
    keywords: ['ssh', 'keygen', 'rsa', 'pem', 'authorized_keys', 'pkcs8'],
    Component: lazy(() => import('../tools/ssh-keygen')),
    seo: {
      title: 'SSH Key Generator Online — RSA, 100% Client-Side',
      description:
        'Generate an RSA-2048/3072/4096 SSH key pair using the browser\'s WebCrypto. Outputs a PKCS#8 PEM private key and an OpenSSH-format public key. Nothing uploaded.',
    },
    content: {
      about:
        'Uses WebCrypto\'s `crypto.subtle.generateKey` to produce an RSA pair, then exports the private key as PKCS#8 PEM and the public key in the standard OpenSSH `ssh-rsa <base64> <comment>` form. Both are downloadable.',
      useCases: [
        'Bootstrapping a deploy key for a CI runner where you don\'t want to ssh-keygen from your machine.',
        'Generating a one-off key for a short-lived test environment.',
        'Replacing a compromised key without leaving the browser.',
      ],
      gotchas: [
        'Modern setups should prefer Ed25519 — but most browsers do not yet expose Ed25519 export. RSA-4096 remains widely accepted.',
        'PKCS#8 PEM is what `ssh -i` accepts. If a tool insists on legacy OpenSSH format, run `ssh-keygen -p -m PEM -f keyfile`.',
      ],
    },
  },
  {
    slug: 'api-tester',
    name: 'API Request Tester',
    description: 'Send REST requests with custom headers and a body, all in browser.',
    category: 'network',
    keywords: ['api', 'rest', 'http', 'postman', 'curl', 'request', 'fetch'],
    Component: lazy(() => import('../tools/api-tester')),
    seo: {
      title: 'API Request Tester Online — REST, Postman Alternative in Browser',
      description:
        'Send GET, POST, PUT, PATCH, DELETE requests from your browser with custom headers and a body. Inspect status, headers, and pretty-printed JSON response.',
    },
    content: {
      about:
        'A lightweight in-browser REST client. Pick a method, add headers, optionally send a body, and inspect the parsed response with timing.',
      useCases: [
        'Smoke-testing an internal API without spinning up Postman.',
        'Sharing a request URL plus headers with a teammate via a single screenshot.',
        'Quickly checking what your API returns for a given Authorization header.',
      ],
      gotchas: [
        'Browser CORS will block requests to APIs that do not return permissive `Access-Control-Allow-Origin` headers — there is no way around this from a webpage. The Linux desktop build of debugdaily skips this restriction.',
        'Sensitive bearer tokens are visible to any extension installed in your browser. For high-stakes secrets, use the desktop app or curl.',
      ],
    },
  },
  {
    slug: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Geolocate any IP plus ISP, ASN, VPN/proxy detection.',
    category: 'network',
    keywords: ['ip', 'geolocation', 'isp', 'asn', 'vpn', 'proxy'],
    Component: lazy(() => import('../tools/ip-lookup')),
    seo: {
      title: 'IP Lookup — Geolocation, ISP, ASN, VPN Detection Online',
      description:
        'Look up any public IPv4/IPv6 address. See country, city, ISP, ASN, reverse DNS, and whether the address belongs to a VPN, proxy, or hosting provider.',
    },
    content: {
      about:
        'Server-side lookup against ip-api.com. Detects your own IP if no input is provided, or queries any public IP. Returns location, ISP/org, ASN, reverse DNS, and proxy/VPN/hosting flags.',
      useCases: [
        'Confirming where a suspicious connection is coming from in your access logs.',
        'Verifying that your VPN is masking your real ISP.',
        'Checking the ASN of a target IP before allow-listing it in a firewall.',
      ],
      gotchas: [
        'Free-tier geolocation is approximate — city is rarely better than ±50 km.',
        'VPN/proxy detection lags reality. Newly-rotated VPN exits may not be flagged yet.',
      ],
    },
  },
  {
    slug: 'whois',
    name: 'WHOIS Lookup',
    description: 'Domain registration, expiry, registrar and nameservers via RDAP.',
    category: 'network',
    keywords: ['whois', 'rdap', 'domain', 'registrar', 'expiry', 'nameservers'],
    Component: lazy(() => import('../tools/whois')),
    seo: {
      title: 'WHOIS Lookup Online — Domain Registration, Expiry, Nameservers',
      description:
        'Look up any domain via RDAP (modern WHOIS): registrar, registrant, registration date, last updated, expiry, status, and nameservers. Color-coded expiry.',
    },
    content: {
      about:
        'Queries the public RDAP system (rdap.org) for any registered domain. RDAP is the modern, JSON-based replacement for legacy WHOIS — same data, structured output, no rate-limiting weirdness.',
      useCases: [
        'Catching a domain that\'s about to expire so you can renew it.',
        'Confirming who registered a suspicious lookalike domain.',
        'Auditing the nameservers a domain currently points at.',
      ],
      gotchas: [
        'ccTLDs (e.g. .uk, .br, .jp) often return less data than gTLDs by design — privacy regulations vary.',
        'Recently-transferred domains may show stale registrar info for up to 24 hours.',
      ],
    },
  },
  {
    slug: 'http-headers',
    name: 'HTTP Headers Inspector',
    description: 'See response headers + a security score for any URL.',
    category: 'network',
    keywords: ['http', 'headers', 'security', 'csp', 'hsts', 'cors'],
    Component: lazy(() => import('../tools/http-headers')),
    seo: {
      title: 'HTTP Headers Inspector & Security Score Online',
      description:
        'Fetch any URL server-side and inspect every response header, plus a security score covering HSTS, CSP, X-Frame-Options, Content-Type-Options, Referrer-Policy and Permissions-Policy.',
    },
    content: {
      about:
        'Server-side fetch (no CORS limits) followed by analysis of the six security headers that actually matter. Each check explains why it matters and shows the actual returned value.',
      useCases: [
        'Auditing a new deployment\'s security posture before announcing it.',
        'Comparing two environments to confirm the same headers are set.',
        'Generating a "what we\'re missing" list before an audit.',
      ],
      gotchas: [
        'A weak score isn\'t always actionable — some headers (CSP) take real engineering to enable safely.',
        'Server-side fetch follows redirects; the final URL is what\'s actually inspected.',
      ],
    },
  },
  {
    slug: 'uptime-checker',
    name: 'Uptime Checker',
    description: 'Is the site up? Status, redirect chain, and round-trip time.',
    category: 'network',
    keywords: ['uptime', 'down', 'status', 'redirect', 'health', 'monitor'],
    Component: lazy(() => import('../tools/uptime-checker')),
    seo: {
      title: 'Website Uptime Checker — Is It Down for Everyone? Online',
      description:
        'Check if a URL is reachable, see its status code, the full redirect chain, and total response time. Up to 5 redirects followed before giving up.',
    },
    content: {
      about:
        'Server-side GET with manual redirect following. Reports each hop, the final status, and total time end-to-end. Good for "is it down for me, or down for everyone?"',
      useCases: [
        'Confirming a CDN issue isn\'t local before paging on-call.',
        'Auditing a redirect chain for unnecessary hops that hurt SEO.',
        'Spot-checking a deploy after pushing.',
      ],
      gotchas: [
        'Single-region check — for true "down for everyone" answers use a multi-region monitor.',
        'Some sites return 200 to bots but not to real users — this tool sends a generic User-Agent.',
      ],
    },
  },
  {
    slug: 'meta-preview',
    name: 'Meta Tag & OG Preview',
    description: 'Preview how a URL renders on Google, Twitter, Facebook & LinkedIn.',
    category: 'inspect',
    keywords: ['meta', 'og', 'opengraph', 'twitter', 'preview', 'seo'],
    Component: lazy(() => import('../tools/meta-preview')),
    seo: {
      title: 'Meta Tag & Open Graph Preview — Google, Twitter, Facebook Online',
      description:
        'Paste any URL; we fetch it server-side, parse meta + Open Graph + Twitter card tags, and render lookalike previews for Google, Twitter, Facebook and LinkedIn.',
    },
    content: {
      about:
        'Fetches the HTML from the URL, parses standard meta tags plus Open Graph and Twitter Card tags, and renders three preview cards that approximate what each platform will show.',
      useCases: [
        'Verifying a redesigned blog post will look right when shared.',
        'Catching missing or oversized og:image before launch.',
        'Auditing a landing page for SEO basics (title length, description, canonical).',
      ],
      gotchas: [
        'Real social previews can lag — platforms cache. Use each platform\'s official debugger to force a re-scrape.',
        'Sites that gate content behind JavaScript may not expose meta tags to a server-side fetch.',
      ],
    },
  },
  {
    slug: 'ping-test',
    name: 'Ping Test',
    description: 'TCP-connect timing to any host:port from our server.',
    category: 'network',
    keywords: ['ping', 'latency', 'tcp', 'connect', 'rtt'],
    Component: lazy(() => import('../tools/ping-test')),
    seo: {
      title: 'Ping Test — TCP Connect Latency to Any Host Online',
      description:
        'Measure round-trip time and packet loss to any host:port via TCP connect. Configurable sample count. Returns min/avg/max plus per-probe results.',
    },
    content: {
      about:
        'Issues a sequence of TCP connects to the chosen host:port and records the time-to-connect for each. Reports min, avg, max, and loss percentage.',
      useCases: [
        'Comparing latency to two candidate API endpoints from the same region.',
        'Spotting intermittent packet loss to a service.',
        'Confirming a port is open and reachable from the public internet.',
      ],
      gotchas: [
        'TCP connect is not ICMP. Times include the SYN/SYN-ACK round trip plus any rate-limiting at the server.',
        'Single-region — multi-region latency probes need a paid monitoring service.',
      ],
    },
  },
  {
    slug: 'ip-blacklist',
    name: 'IP Blacklist Checker',
    description: 'Check an IP against 12 DNS-based blocklists used by mail providers.',
    category: 'network',
    keywords: ['blacklist', 'dnsbl', 'spamhaus', 'reputation', 'email', 'spam'],
    Component: lazy(() => import('../tools/ip-blacklist')),
    seo: {
      title: 'IP Blacklist Checker — DNSBL Reputation Online',
      description:
        'Look up an IPv4 address across 12 DNSBLs including Spamhaus, Barracuda, SpamCop, SORBS, and CBL. Per-list results with the actual response code returned.',
    },
    content: {
      about:
        'Performs the standard DNSBL query (reverse-octet + zone) for each list and reports which ones return a hit. Hit responses include the address-class TXT response from the list, useful for triage.',
      useCases: [
        'Investigating bounced email — being on a major DNSBL is the usual culprit.',
        'Auditing a new VPS IP before sending production mail.',
        'Verifying delisting requests took effect.',
      ],
      gotchas: [
        'A clean DNSBL run does not mean clean reputation — Gmail and Microsoft use proprietary signals on top.',
        'Listings on small/abandoned DNSBLs are usually noise. Spamhaus, Barracuda, and SpamCop are the ones receivers care about.',
      ],
    },
  },
  {
    slug: 'responsive-tester',
    name: 'Responsive Design Tester',
    description: 'Open any URL across mobile, tablet, and desktop sizes side-by-side.',
    category: 'inspect',
    keywords: ['responsive', 'mobile', 'tablet', 'breakpoint', 'iphone', 'ipad', 'preview'],
    Component: lazy(() => import('../tools/responsive-tester')),
    seo: {
      title: 'Responsive Design Tester — All Devices Side-by-Side Online',
      description:
        'Render any URL across 10 device sizes — iPhone, Pixel, Galaxy, iPad, and three desktop widths — at the same time. No browser extensions, no install.',
    },
    content: {
      about:
        'Loads the URL inside ten sandboxed iframes, each set to a real device\'s viewport size and rendered at a comfortable scale. See your responsive breakpoints all at once.',
      useCases: [
        'Spot-checking a CSS change across mobile, tablet, and desktop without resizing the browser.',
        'Demoing a layout to stakeholders without sending screenshots.',
        'Sanity-checking that a third-party widget renders on small screens.',
      ],
      gotchas: [
        'Sites that send `X-Frame-Options: DENY` or a strict frame-ancestors CSP refuse to load in iframes — that\'s the browser, not us.',
        'Iframes don\'t emulate touch or device pixel ratio. Use Chromium DevTools\' device toolbar for true emulation.',
      ],
    },
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for any text or URL, PNG and SVG download.',
    category: 'generate',
    keywords: ['qr', 'qrcode', 'barcode', 'wifi', 'png', 'svg'],
    Component: lazy(() => import('../tools/qr-code-generator')),
    seo: {
      title: 'QR Code Generator Online — Free, PNG & SVG, Custom Colors',
      description:
        'Generate QR codes for URLs, text, vCards, or Wi-Fi credentials. Download as PNG or SVG. Custom error correction, size, foreground and background colors. 100% in-browser.',
    },
    content: {
      about:
        'Wraps the open-source qrcode library to produce QR codes entirely in your browser. Adjustable error correction (L/M/Q/H), pixel size, and dual-color theming. Output is a real PNG/SVG, not an embedded screenshot.',
      useCases: [
        'Putting a sign-up URL on a printed flyer or conference badge.',
        'Generating a Wi-Fi join QR for guests (use the WIFI: format).',
        'Embedding a deeplink in an email or video frame.',
      ],
      gotchas: [
        'Higher error correction (Q/H) makes the code more resilient to damage but stores less data.',
        'Black-on-white scans more reliably than custom colors. Stick to high-contrast pairs.',
      ],
    },
  },
  {
    slug: 'random-number',
    name: 'Random Number Generator',
    description: 'Cryptographically random numbers in a range, with or without duplicates.',
    category: 'generate',
    keywords: ['random', 'number', 'rng', 'lottery', 'pick', 'generator'],
    Component: lazy(() => import('../tools/random-number')),
    seo: {
      title: 'Random Number Generator — Cryptographically Secure, Online',
      description:
        'Generate cryptographically random integers in any range, with or without duplicates. Optional ascending/descending sort. Backed by crypto.getRandomValues — suitable for tokens.',
    },
    content: {
      about:
        'Uses crypto.getRandomValues for true random output (not Math.random). Configurable range, count, duplicate behavior, and result ordering.',
      useCases: [
        'Picking a winner for a giveaway or lottery in front of an audience.',
        'Generating a list of seed values for property-based testing.',
        'Producing a random sample of row IDs from a known range.',
      ],
      gotchas: [
        '`Math.random` is NOT cryptographically secure — never use it for tokens, OTPs, or anything an attacker would care about.',
        'Modulo bias is negligible for ranges much smaller than 2^32 (which this tool handles).',
      ],
    },
  },
  {
    slug: 'timezone-converter',
    name: 'Time Zone Converter',
    description: 'Convert any moment to multiple time zones at once.',
    category: 'convert',
    keywords: ['timezone', 'tz', 'utc', 'convert', 'meeting', 'world clock'],
    Component: lazy(() => import('../tools/timezone-converter')),
    seo: {
      title: 'Time Zone Converter — World Clock for Meetings, Online',
      description:
        'Convert any date and time across multiple time zones simultaneously. Auto-detects your local zone. Add or remove zones. IANA names supported (Asia/Tokyo, America/New_York…).',
    },
    content: {
      about:
        'Uses the browser\'s `Intl.DateTimeFormat` API for accurate conversion across IANA time zones. DST is handled automatically. Add as many zones as you want; the page persists nothing — refresh to reset.',
      useCases: [
        'Picking a meeting time that works for teams across continents.',
        'Verifying when a deploy window opens across regions.',
        'Translating a UTC timestamp from a log into something a non-engineer can act on.',
      ],
      gotchas: [
        'IANA names are case-sensitive (`America/New_York`, not `america/new_york`).',
        'Past dates use the historical DST rules at that point — usually correct, but confirm if you\'re investigating something pre-2000.',
      ],
    },
  },
  {
    slug: 'markdown-table',
    name: 'Markdown Table Generator',
    description: 'Build markdown tables visually, import from CSV or TSV.',
    category: 'generate',
    keywords: ['markdown', 'table', 'csv', 'tsv', 'github'],
    Component: lazy(() => import('../tools/markdown-table')),
    seo: {
      title: 'Markdown Table Generator — Visual Editor, CSV Import, Online',
      description:
        'Edit a markdown table in a familiar grid: add rows, columns, set column alignment. Import existing CSV or TSV. Output is GitHub-flavored Markdown ready to paste.',
    },
    content: {
      about:
        'Skips the "remember the pipe-and-dash syntax" tax. Type into cells like a spreadsheet, choose alignment per column, and copy out the markdown. Optional CSV/TSV import for migrating existing tables.',
      useCases: [
        'Adding a comparison table to a README without doing the syntax in your head.',
        'Converting a spreadsheet snippet into markdown for a PR description.',
        'Drafting documentation tables in a clean visual editor.',
      ],
      gotchas: [
        'Pipe characters inside cells need to be escaped as `\\|` when you paste the result somewhere.',
        'Some markdown renderers ignore the `:---:` alignment row — confirm your target supports GFM.',
      ],
    },
  },
  {
    slug: 'date-diff',
    name: 'Date Diff Calculator',
    description: 'Difference between two dates in years, days, hours and working days.',
    category: 'convert',
    keywords: ['date', 'diff', 'difference', 'duration', 'working days'],
    Component: lazy(() => import('../tools/date-diff')),
    seo: {
      title: 'Date Difference Calculator — Years, Days, Working Days Online',
      description:
        'Compute the difference between two dates: total seconds/minutes/hours/days/weeks plus a calendar-aware breakdown (Yy Mm Dd Hh) and working-day count (Mon–Fri).',
    },
    content: {
      about:
        'Two date/time inputs, multiple ways to read the gap: total counts at every common granularity, a calendar-aware "1y 2m 5d 6h" breakdown, and a working-days (Mon–Fri) count.',
      useCases: [
        'Counting working days between two project milestones.',
        'Sanity-checking a contract start/end period.',
        'Quickly answering "how long ago was…" without spreadsheet formulas.',
      ],
      gotchas: [
        'Working-days count assumes Mon–Fri are workdays — does not account for holidays.',
        'Months don\'t have a fixed number of days, so the "y/m/d" breakdown can shift if you swap the two dates.',
      ],
    },
  },
  {
    slug: 'curl-builder',
    name: 'cURL Command Builder',
    description: 'Build a cURL command from method, URL, headers and body.',
    category: 'generate',
    keywords: ['curl', 'command', 'http', 'request', 'cli'],
    Component: lazy(() => import('../tools/curl-builder')),
    seo: {
      title: 'cURL Command Builder — Visual Form to Shell Online',
      description:
        'Build a cURL command from a visual form: method, URL, headers, body, and common flags (-L, -k, -s, -i). Output is shell-escaped and ready to paste into a terminal.',
    },
    content: {
      about:
        'Form inputs become a properly shell-escaped `curl` command. Single-quotes anything containing whitespace, escapes embedded quotes correctly, and breaks long commands across lines for readability.',
      useCases: [
        'Sharing an API call with a teammate without screenshotting Postman.',
        'Documenting a webhook reproduction in a bug report.',
        'Generating a paste-ready command for a CI step or runbook.',
      ],
      gotchas: [
        'Body is sent as `--data-raw`, which doesn\'t URL-encode. Use `--data-urlencode` manually if you need that.',
        'Generated quoting works for bash/zsh. Windows cmd users need to swap single quotes for double, or use WSL.',
      ],
    },
  },
  {
    slug: 'json-path',
    name: 'JSONPath Tester',
    description: 'Query a JSON document with JSONPath ($) expressions.',
    category: 'inspect',
    keywords: ['jsonpath', 'jq', 'query', 'json', 'extract'],
    Component: lazy(() => import('../tools/json-path')),
    seo: {
      title: 'JSONPath Tester Online — Query JSON Live',
      description:
        'Evaluate JSONPath expressions ($, .field, [n], [a:b], [*], ..) against any JSON document live in your browser. Great for designing transforms before piping them through jq.',
    },
    content: {
      about:
        'Compact JSONPath evaluator written from scratch. Supports root (`$`), property access, array indexing (with negative indices), slices (`[a:b]`), wildcard (`[*]`), and recursive descent (`..`).',
      useCases: [
        'Designing a path expression to feed into a Logstash filter or Postman test.',
        'Pulling one nested field out of a large API response.',
        'Verifying a path before relying on it in an alerting rule.',
      ],
      gotchas: [
        'Filter expressions (`?(@.price < 30)`) and script expressions are not supported. For those, use a full jq tester.',
        'JSONPath has multiple competing dialects — this implementation aligns with the common Stefan Goessner subset.',
      ],
    },
  },
  {
    slug: 'slug-generator',
    name: 'Slug Generator',
    description: 'Convert a title to a URL-safe slug. Strips accents and stop-words.',
    category: 'convert',
    keywords: ['slug', 'url', 'permalink', 'seo', 'kebab', 'title'],
    Component: lazy(() => import('../tools/slug-generator')),
    seo: {
      title: 'Slug Generator — URL-Safe Slugs from Titles, Online',
      description:
        'Convert any title or phrase into a clean URL slug. Strips accents (NFKD), normalizes whitespace, optional stop-word removal. Picks your separator (-, _, .).',
    },
    content: {
      about:
        'Normalizes Unicode (NFKD), strips diacritics, replaces ampersands with "and", collapses runs of separators, and optionally drops common English stop-words for shorter slugs.',
      useCases: [
        'Generating a permalink for a blog post or product.',
        'Turning a CMS title field into a clean slug column.',
        'Producing repo-friendly directory names from a free-text title.',
      ],
      gotchas: [
        'Stop-word stripping is English only. Disable for non-English content.',
        'URL slugs should usually be lowercase — keep "lowercase" enabled unless you have a reason not to.',
      ],
    },
  },
  {
    slug: 'chmod-calculator',
    name: 'Chmod Calculator',
    description: 'Toggle Unix permissions; get the octal and symbolic forms.',
    category: 'network',
    keywords: ['chmod', 'permissions', 'unix', 'octal', 'symbolic', 'rwx'],
    Component: lazy(() => import('../tools/chmod-calculator')),
    seo: {
      title: 'Chmod Calculator — Octal & Symbolic Unix Permissions Online',
      description:
        'Pick read / write / execute for owner, group and other; get the octal value (e.g. 755) and symbolic form (rwxr-xr-x) plus the chmod command to paste.',
    },
    content: {
      about:
        'Click the checkboxes for read/write/execute across owner/group/other, or type the octal directly. The tool shows both the octal value and the human-readable symbolic form, plus the full chmod command.',
      useCases: [
        'Remembering why 755 is "executable for owner, readable for everyone else".',
        'Setting up a deploy script that needs specific file modes.',
        'Translating between rwxr-xr-x and 755 in either direction.',
      ],
      gotchas: [
        'Setuid (4xxx), setgid (2xxx), and sticky bit (1xxx) aren\'t exposed in the UI — add them manually if needed (e.g. 4755).',
      ],
    },
  },
  {
    slug: 'basic-auth-generator',
    name: 'Basic Auth Header',
    description: 'Generate an HTTP Basic Authorization header from a username and password.',
    category: 'generate',
    keywords: ['basic-auth', 'authorization', 'http', 'header', 'curl'],
    Component: lazy(() => import('../tools/basic-auth-generator')),
    seo: {
      title: 'HTTP Basic Auth Header Generator — Online',
      description:
        'Generate an Authorization: Basic <base64> header from any username and password. Includes the equivalent curl -u command. Encoding happens entirely in your browser.',
    },
    content: {
      about:
        'Base64-encodes `user:password` and wraps it in the standard `Authorization: Basic` header. Outputs both the full header line and the curl shorthand.',
      useCases: [
        'Documenting an API call in a runbook or PR description.',
        'Verifying what Postman is actually sending.',
        'Generating a test header for a CI step.',
      ],
      gotchas: [
        'Basic auth is base64, not encryption. Anyone with the header can read the password. Use only over HTTPS.',
        'Bcrypt-hashed passwords on the server are fine; Basic still sends the plaintext over the wire to be compared.',
      ],
    },
  },
  {
    slug: 'mime-types',
    name: 'MIME Type Lookup',
    description: 'Look up MIME types by file extension or search by content type.',
    category: 'inspect',
    keywords: ['mime', 'content-type', 'extension', 'media-type'],
    Component: lazy(() => import('../tools/mime-types')),
    seo: {
      title: 'MIME Type Lookup — Search by Extension or Content-Type',
      description:
        'Searchable reference of common file extensions and their MIME / Content-Type values. Covers text, image, audio, video, font, and Office document types.',
    },
    content: {
      about:
        'Filterable list of the file extensions and MIME types you actually encounter. Search either direction — by `.webp` or by `image/webp`.',
      useCases: [
        'Setting the right Content-Type on an upload endpoint.',
        'Debugging a browser refusing to render a file.',
        'Writing an allow-list of accepted upload types for your form.',
      ],
    },
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert a JSON array of objects to CSV with flatten + delimiter options.',
    category: 'convert',
    keywords: ['json', 'csv', 'convert', 'flatten', 'spreadsheet'],
    Component: lazy(() => import('../tools/json-to-csv')),
    seo: {
      title: 'JSON to CSV Converter — Flatten Nested, Online',
      description:
        'Paste a JSON array of objects; get clean CSV with proper escaping, your choice of delimiter, and optional nested-object flattening. Pure browser.',
    },
    content: {
      about:
        'Inspects the union of keys across every object, optionally flattens nested objects with dot notation, and emits CSV with RFC 4180 quoting.',
      useCases: [
        'Importing an API response into a spreadsheet.',
        'Preparing data for `pandas.read_csv` or similar.',
        'Quickly diffing a JSON dataset with column-by-column eyes.',
      ],
      gotchas: [
        'Nested arrays inside objects become JSON-string cells. For tabular nested data, pre-process first.',
      ],
    },
  },
  {
    slug: 'json-to-yaml',
    name: 'JSON to YAML',
    description: 'Convert JSON to clean YAML with proper indentation.',
    category: 'convert',
    keywords: ['json', 'yaml', 'convert', 'kubernetes', 'config'],
    Component: lazy(() => import('../tools/json-to-yaml')),
    seo: {
      title: 'JSON to YAML Converter — Online, K8s & Compose Friendly',
      description:
        'Paste JSON; get well-formatted YAML with your chosen indent. Useful for converting JSON snippets into Kubernetes manifests, Docker Compose files, or GitHub Actions workflows.',
    },
    content: {
      about:
        'Round-trips JSON through js-yaml to produce clean YAML output. The inverse of our existing YAML Validator, which handles YAML → JSON.',
      useCases: [
        'Translating a JSON config into a Kubernetes manifest.',
        'Migrating from a JSON-based config to YAML.',
        'Quickly diffing two configs in YAML form (more readable than JSON for large nested objects).',
      ],
    },
  },
  {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Pretty-print or minify XML; validates structure as it goes.',
    category: 'format',
    keywords: ['xml', 'format', 'pretty', 'minify', 'beautify'],
    Component: lazy(() => import('../tools/xml-formatter')),
    seo: {
      title: 'XML Formatter & Validator Online — Pretty-Print or Minify',
      description:
        'Paste XML, get a clean indented version with proper nesting. Toggle minify mode for transport. Validates structure via the browser\'s built-in DOMParser.',
    },
    content: {
      about:
        'Tokenizes the XML into tags + text and re-indents based on depth. Validates the document by parsing it with the browser\'s DOMParser — invalid XML produces a clear error.',
      useCases: [
        'Reading SOAP envelopes from a server log.',
        'Inspecting an Android `strings.xml` or `AndroidManifest.xml`.',
        'Diffing two RSS feeds for changes.',
      ],
      gotchas: [
        'CDATA blocks and embedded XML processing instructions are preserved verbatim, not deeply re-indented.',
      ],
    },
  },
  {
    slug: 'hmac-generator',
    name: 'HMAC Generator',
    description: 'Generate HMAC signatures (SHA-1/256/384/512) for webhook verification.',
    category: 'generate',
    keywords: ['hmac', 'sign', 'webhook', 'sha256', 'crypto', 'stripe', 'github'],
    Component: lazy(() => import('../tools/hmac-generator')),
    seo: {
      title: 'HMAC Generator Online — SHA-1, SHA-256, SHA-384, SHA-512',
      description:
        'Generate HMAC signatures with WebCrypto. Pick the algorithm, paste a secret and a message, get hex and base64 digests. Used by Stripe, GitHub, Slack and most webhook providers.',
    },
    content: {
      about:
        'Uses WebCrypto\'s HMAC implementation. Outputs both hex (the standard for header signatures) and base64 (used by some providers).',
      useCases: [
        'Reproducing the signature a webhook provider sent you, to verify their docs match reality.',
        'Generating a test signature for your own webhook implementation.',
        'Debugging a "signature mismatch" error by comparing computed vs. received hex.',
      ],
      gotchas: [
        'HMAC is sensitive to the exact bytes of the secret and message. Whitespace, trailing newlines, and encoding all matter.',
        'Many providers sign the raw request body, not a parsed/re-serialized version. Capture the original bytes when verifying.',
      ],
    },
  },
  {
    slug: 'totp-generator',
    name: 'TOTP / 2FA Code Generator',
    description: 'Generate or validate TOTP codes (Google Authenticator style).',
    category: 'generate',
    keywords: ['totp', '2fa', 'otp', 'authenticator', 'google', 'rfc6238'],
    Component: lazy(() => import('../tools/totp-generator')),
    seo: {
      title: 'TOTP Code Generator (2FA) Online — RFC 6238',
      description:
        'Generate Time-based One-Time Passwords for any base32 secret. Pick algorithm (SHA-1/256/512), digits (6/7/8), and period. Useful for testing 2FA flows.',
    },
    content: {
      about:
        'Full RFC 6238 TOTP implementation in WebCrypto. Pulls the current Unix time, advances the counter, and computes HMAC-SHA{1,256,512} on the secret. Shows the current code and the upcoming one with a countdown bar.',
      useCases: [
        'Testing 2FA login flows during development without an authenticator app.',
        'Verifying a secret a provider gave you actually generates the codes they expect.',
        'Building a one-off CLI / CI tool that needs an OTP.',
      ],
      gotchas: [
        'Secret must be base32. Most providers show it explicitly; some embed it in an otpauth:// QR.',
        'The default for Google Authenticator, 1Password, Authy, Bitwarden is SHA-1 + 6 digits + 30s. Don\'t change these unless your provider requires it.',
      ],
    },
  },
  {
    slug: 'iban-validator',
    name: 'IBAN Validator',
    description: 'Validate an IBAN with mod-97 check and country-length rules.',
    category: 'inspect',
    keywords: ['iban', 'bank', 'banking', 'validate', 'mod97', 'sepa'],
    Component: lazy(() => import('../tools/iban-validator')),
    seo: {
      title: 'IBAN Validator Online — Mod-97 Check, 70+ Countries',
      description:
        'Validate International Bank Account Numbers (IBANs) using the standard mod-97 checksum and country-specific length rules. Supports all 75 SEPA + non-SEPA IBAN countries.',
    },
    content: {
      about:
        'Validates structure (country code, expected length) and computes the ISO 13616 mod-97 checksum. Returns country, check digits, and BBAN (basic bank account number) on success.',
      useCases: [
        'Validating user input on a payment or invoicing form.',
        'Sanity-checking a partner\'s bank details before issuing a payout.',
        'Cleaning up an imported customer list with malformed IBAN values.',
      ],
      gotchas: [
        'A passing checksum means the IBAN is structurally valid — NOT that the account exists or is open. That requires bank-side verification.',
        'Some countries use multiple IBAN formats; this tool uses the standard ISO 13616 lengths.',
      ],
    },
  },
  {
    slug: 'docker-run-to-compose',
    name: 'docker run → docker-compose',
    description: 'Convert a `docker run` command into an equivalent docker-compose service.',
    category: 'convert',
    keywords: ['docker', 'docker-compose', 'convert', 'yaml', 'container'],
    Component: lazy(() => import('../tools/docker-run-to-compose')),
    seo: {
      title: 'docker run → docker-compose Converter Online',
      description:
        'Paste a `docker run` command; get the equivalent docker-compose service block. Supports -p, -v, -e, --name, --restart, --network, --cap-add, --link and more.',
    },
    content: {
      about:
        'Tokenizes a `docker run` command, maps each flag to its docker-compose equivalent, and emits valid Compose YAML. Handles quoted values and line continuations.',
      useCases: [
        'Migrating an ad-hoc Docker run line from a README into a maintainable compose file.',
        'Documenting a complex container setup more readably.',
        'Onboarding a service into a multi-container app.',
      ],
      gotchas: [
        'Unknown flags are skipped — review the output before deploying.',
        'Compose has features (depends_on health checks, build contexts) that have no `docker run` equivalent. Add those by hand.',
      ],
    },
  },
  {
    slug: 'rot13',
    name: 'ROT13 / Caesar Cipher',
    description: 'Encode or decode text with a letter rotation cipher.',
    category: 'encode',
    keywords: ['rot13', 'caesar', 'cipher', 'rotate', 'obfuscate'],
    Component: lazy(() => import('../tools/rot13')),
    seo: {
      title: 'ROT13 / Caesar Cipher — Online Text Encoder & Decoder',
      description:
        'Rotate letters by 13 (ROT13, the classic) or any custom shift (Caesar cipher). Live conversion as you type. Non-letter characters are preserved.',
    },
    content: {
      about:
        'Pure letter rotation. ROT13 (shift 13) is its own inverse, so a single click both encodes and decodes — a fun curiosity, and useful for lightly obfuscating spoilers or solutions.',
      useCases: [
        'Hiding spoilers in a forum post.',
        'Quick light obfuscation that\'s trivially reversible.',
        'Solving puzzles or CTFs that use shift ciphers.',
      ],
      gotchas: [
        'Not real encryption. Anyone can reverse it in a second.',
      ],
    },
  },
  {
    slug: 'roman-numerals',
    name: 'Roman Numeral Converter',
    description: 'Convert numbers to Roman numerals and back.',
    category: 'convert',
    keywords: ['roman', 'numeral', 'convert', 'i', 'v', 'x', 'l', 'c', 'd', 'm'],
    Component: lazy(() => import('../tools/roman-numerals')),
    seo: {
      title: 'Roman Numeral Converter Online — Number ↔ Roman',
      description:
        'Convert any integer (1–3999) to its Roman numeral, or paste a Roman numeral to get its integer value. Round-trip validated, subtractive notation.',
    },
    content: {
      about:
        'Greedy conversion using the standard subtractive pairs (CM, CD, XC, XL, IX, IV). Validates Roman input by round-tripping back to a number and comparing.',
      useCases: [
        'Translating copyright years or movie sequels.',
        'Writing chapter numbers in a doc.',
        'Solving a crossword or trivia question.',
      ],
      gotchas: [
        'Standard Romans top out at 3999 (MMMCMXCIX). Larger values existed historically but had no standard form.',
      ],
    },
  },
  {
    slug: 'nato-phonetic',
    name: 'NATO Phonetic Alphabet',
    description: 'Spell out text in the ICAO/NATO phonetic alphabet.',
    category: 'convert',
    keywords: ['nato', 'phonetic', 'alphabet', 'alpha', 'bravo', 'spelling'],
    Component: lazy(() => import('../tools/nato-phonetic')),
    seo: {
      title: 'NATO Phonetic Alphabet Converter — Text to Alpha/Bravo Online',
      description:
        'Translate any text into the ICAO/NATO phonetic alphabet: A → Alpha, B → Bravo, … Useful for reading codes or passwords aloud over a noisy line.',
    },
    content: {
      about:
        'Standard NATO phonetic alphabet (used by airlines, military, emergency services). Letters become words, digits speak their English number, spaces are explicit.',
      useCases: [
        'Reading a tracking number or activation code over the phone.',
        'Spelling a password to a colleague without confusion between "M" and "N".',
        'Writing operational docs that mix typed and spoken communication.',
      ],
    },
  },
  {
    slug: 'list-converter',
    name: 'List Converter',
    description: 'Convert between newline, comma, JSON array, SQL IN list and more.',
    category: 'convert',
    keywords: ['list', 'csv', 'json', 'sql', 'convert', 'array'],
    Component: lazy(() => import('../tools/list-converter')),
    seo: {
      title: 'List Converter Online — Newline, CSV, JSON Array, SQL IN',
      description:
        'Paste a list in any format (newline, comma, tab, JSON array) and convert to any other. Optional unique / sort / trim. Outputs a JSON array, SQL IN clause, or your choice of delimiter.',
    },
    content: {
      about:
        'Auto-detects the input separator (newlines, commas, semicolons, pipes, tabs, or JSON array) and re-emits in your chosen format. Optionally deduplicates, sorts, and trims.',
      useCases: [
        'Building a `WHERE id IN (\'a\', \'b\', \'c\')` clause from a copy-pasted list.',
        'Cleaning and deduplicating a list of emails from a spreadsheet column.',
        'Converting a textarea-of-names into a JSON array for an API call.',
      ],
    },
  },
  {
    slug: 'email-normalizer',
    name: 'Email Normalizer',
    description: 'Canonical form of an email — strip Gmail dots, +tag aliases, lowercase.',
    category: 'inspect',
    keywords: ['email', 'normalize', 'canonical', 'gmail', 'alias', 'dedupe'],
    Component: lazy(() => import('../tools/email-normalizer')),
    seo: {
      title: 'Email Normalizer — Strip Gmail Dots, Plus-Tags, Online',
      description:
        'Reduce an email to its canonical form: lowercase, drop +tag aliases, remove Gmail dots, map googlemail.com → gmail.com. Useful for deduplicating signup lists.',
    },
    content: {
      about:
        'Applies the well-known canonicalization rules for major providers: Gmail strips dots in the local part and treats googlemail.com identically; many providers (Fastmail, Proton, iCloud, Outlook) honor +tag aliases.',
      useCases: [
        'Deduplicating a signup or subscriber list where one human signed up twice.',
        'Detecting abuse / fraud signups via plus-tag rotation.',
        'Computing a stable hash of "is this the same mailbox?" for analytics.',
      ],
      gotchas: [
        'Outside the well-known providers, dots in the local part ARE significant. Don\'t apply Gmail rules to arbitrary domains.',
      ],
    },
  },
  {
    slug: 'safelink-decoder',
    name: 'Safelink Decoder',
    description: 'Extract the real URL from Outlook, Mimecast, Proofpoint and other wrappers.',
    category: 'inspect',
    keywords: ['safelink', 'outlook', 'mimecast', 'proofpoint', 'redirect', 'url', 'decoder'],
    Component: lazy(() => import('../tools/safelink-decoder')),
    seo: {
      title: 'Safelink Decoder Online — Outlook, Mimecast, Proofpoint URL Unwrap',
      description:
        'Paste a wrapped URL (Microsoft Safe Links, Mimecast, Proofpoint URL Defense, Google, LinkedIn) and extract the real destination. Pure browser, no server lookup.',
    },
    content: {
      about:
        'Matches common URL-wrapping patterns from enterprise email security and ad/redirect trackers, extracts the underlying URL, and URL-decodes it.',
      useCases: [
        'Checking where a link in a corporate email actually goes before clicking.',
        'Cleaning a URL someone shared via an ad-tracked redirect.',
        'Auditing tracking parameters in a campaign\'s outbound links.',
      ],
      gotchas: [
        'Short-link services (t.co, bit.ly, lnkd.in) need a server-side HEAD request to resolve. This tool only handles statically-decodable wrappers.',
      ],
    },
  },
  {
    slug: 'wifi-qr',
    name: 'Wi-Fi QR Code',
    description: 'Generate a QR code that auto-joins a Wi-Fi network when scanned.',
    category: 'generate',
    keywords: ['wifi', 'qr', 'wpa', 'guest', 'network', 'scan'],
    Component: lazy(() => import('../tools/wifi-qr')),
    seo: {
      title: 'Wi-Fi QR Code Generator — Auto-Join Network Online',
      description:
        'Create a QR code that joins a Wi-Fi network automatically. iOS Camera and Android scan it natively. Outputs PNG and SVG. Password never leaves your browser.',
    },
    content: {
      about:
        'Builds the standard WIFI: URI (SSID, encryption type, password, hidden flag) with proper escaping, then renders it as a QR code. Anyone with a modern phone camera can scan and auto-join.',
      useCases: [
        'Posting a guest Wi-Fi QR at reception or in a meeting room.',
        'Printing on a moving-day welcome flyer.',
        'Adding to a conference attendee handout.',
      ],
      gotchas: [
        'The password is in the QR code in plain form. Anyone who photographs the QR can read it.',
        'Use the "hidden" flag only if your network is set to broadcast off — most home routers don\'t need it.',
      ],
    },
  },
  {
    slug: 'ulid-generator',
    name: 'ULID Generator',
    description: 'Generate sortable, URL-safe ULIDs (and decode existing ones).',
    category: 'generate',
    keywords: ['ulid', 'uuid', 'id', 'sortable', 'timestamp'],
    Component: lazy(() => import('../tools/ulid-generator')),
    seo: {
      title: 'ULID Generator Online — Sortable, URL-Safe, 26 Chars',
      description:
        'Generate ULIDs (Universally Unique Lexicographically Sortable Identifiers) in bulk. Decode any ULID to see its timestamp. Crockford base32, no server contact.',
    },
    content: {
      about:
        'ULIDs combine a 48-bit millisecond timestamp with 80 random bits, encoded in Crockford base32. Sortable by creation time, URL-safe, shorter than UUIDs.',
      useCases: [
        'Picking IDs for new records that should sort by creation order.',
        'Replacing UUIDv4 in a new project for better index locality.',
        'Decoding an existing ULID to see when it was created.',
      ],
      gotchas: [
        'ULIDs leak creation time. If that\'s sensitive (e.g. user IDs), use UUIDv4 instead.',
        'Multiple ULIDs generated in the same millisecond aren\'t guaranteed to be monotonic in this implementation.',
      ],
    },
  },
  {
    slug: 'token-generator',
    name: 'API Token Generator',
    description: 'Generate cryptographically random tokens with optional prefixes.',
    category: 'generate',
    keywords: ['token', 'api', 'key', 'secret', 'random', 'bearer'],
    Component: lazy(() => import('../tools/token-generator')),
    seo: {
      title: 'API Token Generator Online — Random, Prefixed, URL-Safe',
      description:
        'Generate secure API tokens with your choice of charset (hex, base64url, alphanumeric), length, and optional prefix (sk_live_, pk_, github_pat_…). Backed by WebCrypto.',
    },
    content: {
      about:
        'Uses crypto.getRandomValues for true randomness. Includes presets for common provider conventions (Stripe-style sk_live_, GitHub-style github_pat_) plus custom prefixes.',
      useCases: [
        'Seeding env vars for a new service: `API_KEY=`, `INTERNAL_TOKEN=`, etc.',
        'Generating signed-URL secrets or webhook signing keys.',
        'Creating per-environment test credentials.',
      ],
      gotchas: [
        'A prefixed token looks like an official key but isn\'t actually issued by that provider — only useful for internal patterns.',
      ],
    },
  },
  {
    slug: 'math-evaluator',
    name: 'Math Evaluator',
    description: 'Evaluate arithmetic expressions with sqrt, sin, log, pow, PI, E and more.',
    category: 'convert',
    keywords: ['math', 'calculator', 'evaluate', 'expression', 'sqrt', 'log'],
    Component: lazy(() => import('../tools/math-evaluator')),
    seo: {
      title: 'Math Expression Evaluator Online — sqrt, log, sin, pow, PI',
      description:
        'Paste an arithmetic expression and get the result. Supports + - * / %, parentheses, and the standard Math functions (sqrt, log, pow, sin, abs, hypot, min, max) plus constants PI, E, LN2.',
    },
    content: {
      about:
        'Pure JavaScript expression evaluator with an identifier allowlist (only Math functions and constants pass). Useful for arithmetic that\'s too annoying for a phone calculator but too simple to open Python.',
      useCases: [
        'Converting "every 15 min for 8 working hours" to a number: `15 * 60 * 8`.',
        'Computing log₂(N) for a binary tree depth.',
        'Quick golden-ratio check: `(1 + sqrt(5)) / 2`.',
      ],
      gotchas: [
        'No arbitrary precision — JavaScript number limits apply (53-bit safe integer, ~15 significant decimals).',
        'Trig functions take radians, not degrees.',
      ],
    },
  },
];

export const toolBySlug: Record<string, Tool> = Object.fromEntries(
  tools.map((t) => [t.slug, t]),
);
