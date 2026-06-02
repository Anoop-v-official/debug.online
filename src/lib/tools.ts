import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export type Category =
  | 'encode'
  | 'format'
  | 'inspect'
  | 'generate'
  | 'network'
  | 'convert';

export interface ToolExample {
  title: string;
  input: string;
  output: string;
  note?: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContent {
  about: string;
  useCases: string[];
  gotchas?: string[];
  howItWorks?: string[];
  examples?: ToolExample[];
  faq?: ToolFaq[];
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
        'A JSON formatter parses raw JSON, validates its syntax, and re-emits it either pretty-printed for human reading or minified for transport. This one runs entirely in your browser using the native JSON.parse and JSON.stringify, so even sensitive payloads — tokens, PII, internal API responses — never leave your machine. When parsing fails, it surfaces the exact offset of the syntax error so you can fix it without guessing.',
      howItWorks: [
        'Pretty-printing inserts indentation and newlines so nested objects and arrays read top to bottom instead of in a single packed line. You pick the indent width (2 or 4 spaces) and the formatter walks the parsed tree, re-serializing with JSON.stringify(value, null, width).',
        'Minifying does the opposite: the parsed tree is re-serialized with no whitespace at all, producing the shortest valid representation. This is what you want before embedding JSON in a URL parameter, a database column, or an environment variable.',
        'Validation is a side effect of parsing — if JSON.parse succeeds the input is, by definition, valid JSON. If it fails, the browser engine returns an error message that usually points at the offending character so the UI can highlight it.',
      ],
      useCases: [
        'Pasting an unreadable single-line API response from curl or a browser network tab to inspect its structure.',
        'Shrinking a config blob before embedding it in a query string, a Kubernetes annotation, or a Terraform variable.',
        'Confirming that a webhook payload is syntactically valid JSON before opening a debugger.',
        'Cleaning up a JSON file whose indentation got mixed across multiple editors.',
        'Spotting the offending character in a large log file that one rogue control character broke.',
        'Re-indenting a fixture file to match a project style guide before committing.',
      ],
      examples: [
        {
          title: 'Pretty-print a minified API response',
          input: '{"user":{"id":42,"email":"jane@example.com","roles":["admin","editor"]}}',
          output:
            '{\n  "user": {\n    "id": 42,\n    "email": "jane@example.com",\n    "roles": [\n      "admin",\n      "editor"\n    ]\n  }\n}',
          note: 'Two-space indent is the default. Use four spaces for projects that demand it.',
        },
        {
          title: 'Minify before stuffing into a URL',
          input: '{\n  "filter": {\n    "status": "open",\n    "owner": null\n  }\n}',
          output: '{"filter":{"status":"open","owner":null}}',
          note: 'The minified form URL-encodes more cleanly and saves bytes in query strings.',
        },
      ],
      gotchas: [
        'Standard JSON forbids comments and trailing commas — both will fail to parse here on purpose. If you need JSON5 or JSONC, strip those constructs first.',
        'JavaScript numbers lose precision past 2^53. Re-stringifying a payload with a 19-digit ID will silently round it. Treat large IDs as strings end-to-end.',
        'Duplicate keys in the input are not flagged: JSON.parse keeps the last one and discards earlier ones. If you suspect collisions, search the raw text first.',
        'Unicode escapes like \\u00e9 are decoded on parse and re-encoded on serialize, so the output may visibly differ from the input even when the value is identical.',
        'A leading Byte Order Mark from a Windows editor will cause a parse error in some browsers. Strip it if you copy-pasted from Notepad.',
      ],
      faq: [
        {
          q: 'Is my JSON sent to a server?',
          a: 'No. Parsing, validation and re-serialization all happen in your browser using the built-in JSON engine. Nothing is uploaded, logged, or stored.',
        },
        {
          q: 'What is the difference between JSON and JSON5?',
          a: 'JSON is the strict spec in RFC 8259: no comments, no trailing commas, double-quoted keys only. JSON5 is an extension that allows comments, single quotes, trailing commas and unquoted keys. This tool accepts strict JSON; convert JSON5 first if needed.',
        },
        {
          q: 'Why does my formatter report a syntax error at the very end of the file?',
          a: 'Usually a missing closing brace or bracket. The parser only knows something is wrong when it reaches end-of-input without finding the matching token, so the error points to the last character even though the actual mistake is earlier. Search backward for the unclosed structure.',
        },
        {
          q: 'Can I pretty-print very large files?',
          a: 'For files in the tens of megabytes the formatter will still work but may pause the tab briefly while the browser parses. For files in the hundreds of megabytes, prefer a streaming tool like jq from the command line.',
        },
        {
          q: 'Does this support sorting keys alphabetically?',
          a: 'Not currently. For canonical JSON (sorted keys, no insignificant whitespace), use jq --sort-keys. The browser preserves insertion order on parse and stringify.',
        },
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
        'A JWT decoder splits a JSON Web Token into its three parts, base64url-decodes the header and payload, and parses both as JSON so you can read the claims that an auth system actually issued. This tool does decoding only — it never verifies signatures, and it never sends your token anywhere. That distinction matters: a token that decodes cleanly here can still be rejected by your API for a dozen good reasons.',
      howItWorks: [
        'A JWT looks like header.payload.signature. The header and payload are base64url-encoded JSON; the signature is binary, also base64url. Decoding the first two parts is a matter of replacing - and _ with + and /, adding the right number of = pad characters, base64-decoding, and JSON.parse on the result.',
        'The signature itself is not decoded here because it is opaque without the signing key. Verification — checking that the signature matches the algorithm declared in the header and a key you trust — must happen on your server with a library like jose, jsonwebtoken, or the equivalent in your language.',
        'For convenience the tool computes the time remaining on the exp (expiry) claim, and the time elapsed since iat (issued at) and nbf (not before). These are derived locally from the decoded payload, not pulled from any external time source.',
      ],
      useCases: [
        'Debugging an auth flow when the API rejects your token with no detail beyond "unauthorized".',
        'Confirming which claims your identity provider (Auth0, Okta, Cognito, Keycloak) is actually putting in the access token.',
        'Catching a token with an alg: none header before it gets near production code.',
        'Reading the email or sub claim out of a Google or Microsoft ID token during integration work.',
        'Checking whether an OAuth refresh actually returned a fresh access token, or just handed you the same expiry.',
        'Inspecting a token captured from a HAR file to figure out what scope or audience your client requested.',
      ],
      examples: [
        {
          title: 'Decode a typical access token',
          input:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNzQwMDAwMDAwLCJleHAiOjE3NDAwMDM2MDB9.signature',
          output:
            'Header: {"alg":"HS256","typ":"JWT"}\nPayload: {"sub":"1234567890","name":"Jane Doe","iat":1740000000,"exp":1740003600}\nExpiry: 60 minutes after iat',
          note: 'sub is the subject (usually a user id). exp − iat = 3600 seconds, so this token lasts one hour.',
        },
      ],
      gotchas: [
        'Decoding is not verification. Anything in the payload must be treated as attacker-controlled until your server verifies the signature with the expected algorithm and key.',
        'A token can decode cleanly here but still be rejected because of aud (audience), iss (issuer), kid (key id), or clock skew on your server.',
        'JWTs are not encrypted by default — they are signed. Never put a secret like a password or API key inside a JWT payload assuming nobody can read it.',
        'Refresh tokens are sometimes JWTs and sometimes opaque strings. If decoding fails, you might be looking at the opaque kind.',
        'A surprisingly common production bug is accepting alg: none. Make sure your library has it disabled at the verification layer.',
        'Tokens longer than ~2 KB can be rejected by some intermediaries (load balancers, CDNs) that have header size limits. If you are stuffing every claim into the token, consider an opaque session id instead.',
      ],
      faq: [
        {
          q: 'Is my JWT sent anywhere?',
          a: 'No. The token is decoded entirely in your browser. The signature is not transmitted because this tool does not verify it — only your server should hold the key required to verify.',
        },
        {
          q: 'Can this tool tell me if my token is valid?',
          a: 'It can tell you if the token is well-formed and not expired according to the exp claim, but only your server, holding the signing key, can confirm the signature is correct. Use jose, jsonwebtoken, PyJWT or the equivalent for verification.',
        },
        {
          q: 'What is the difference between JWT, JWS and JWE?',
          a: 'JWS (JSON Web Signature) is a signed token — what most people call "a JWT". JWE (JSON Web Encryption) is encrypted. A JWT is one of those two structures carrying a JSON payload. This decoder targets JWS.',
        },
        {
          q: 'Why does my token decode here but fail in production?',
          a: 'The most common causes are: a kid that does not match any key in your JWKS, an alg the verifier does not accept, an aud that does not include your service, or your server clock being off enough that exp or nbf appears invalid.',
        },
        {
          q: 'Should I use HS256 or RS256?',
          a: 'HS256 uses a shared secret — fine when the same party signs and verifies. RS256 (or ES256) uses an asymmetric key pair — the issuer signs with the private key and verifiers only need the public key, which is what you want when an identity provider signs tokens for many services.',
        },
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
        'Base64 is a way to represent any binary data as ASCII text using just 64 printable characters (A–Z, a–z, 0–9, + and /). It lets you safely paste images, certificates, signatures or arbitrary bytes into places that only accept text — JSON fields, email bodies, environment variables, query strings. This encoder/decoder uses TextEncoder and TextDecoder under the hood, so Unicode input (emoji, accented characters, non-Latin scripts) round-trips correctly, which is something the bare btoa/atob pair in older browser code famously does not.',
      howItWorks: [
        'On encode, the input text is first converted to a byte sequence with UTF-8. Every three bytes (24 bits) are then split into four 6-bit groups, and each group is mapped to one of the 64 alphabet characters. If the input length is not a multiple of three, one or two = pad characters are appended to make the output length a multiple of four.',
        'Decoding reverses the process: every four Base64 characters become three bytes, padding is stripped, and the resulting byte sequence is decoded as UTF-8 back into a string.',
        'Base64 is roughly 33% larger than the binary it represents. That overhead is the price you pay for being safe in text-only channels. If you need to send the data over a transport that handles binary natively, send the binary; if you do not, accept the size cost.',
      ],
      useCases: [
        'Embedding a small image or font directly in a CSS file as a data URI.',
        'Storing a binary value (a small file, a serialized protobuf) inside a JSON column.',
        'Inspecting an Authorization: Basic header to recover the username:password pair.',
        'Reading the header or payload segment of a JWT by hand (with the base64url caveat below).',
        'Passing a multi-line PEM certificate through a single environment variable.',
        'Encoding a webhook secret so it survives a YAML or TOML config file unchanged.',
      ],
      examples: [
        {
          title: 'Encode plain text',
          input: 'Hello, World!',
          output: 'SGVsbG8sIFdvcmxkIQ==',
          note: 'The trailing == is padding because "Hello, World!" is 13 bytes, not a multiple of 3.',
        },
        {
          title: 'Encode Unicode',
          input: 'café ☕',
          output: 'Y2Fmw6kg4piV',
          note: 'UTF-8 encodes é as two bytes and ☕ as three, so the byte length is bigger than the visible character count.',
        },
        {
          title: 'Decode a Basic Auth header',
          input: 'YWxpY2U6c3VwZXItc2VjcmV0',
          output: 'alice:super-secret',
          note: 'The format is username:password, separated by a single colon, then Base64-encoded — anyone with the header can read the password, so always use HTTPS.',
        },
      ],
      gotchas: [
        'Base64url (used in JWTs and URL-safe contexts) replaces + with - and / with _, and may omit padding. It is NOT directly interchangeable with standard Base64; substitute the characters before pasting if you copy a JWT segment in.',
        'The plain btoa() function only accepts Latin-1 code points and throws on emoji or Chinese text. This tool uses TextEncoder/TextDecoder to encode UTF-8 first, which is what you almost always want.',
        'Base64 is encoding, not encryption. Anyone can decode it back. Use it for transport safety, never for secrecy.',
        'Whitespace inside an encoded string (line breaks every 76 characters, MIME-style) is harmless on decode in this tool but can break strict parsers. Strip it if you hit problems elsewhere.',
        'Padding is mandatory in strict Base64 (RFC 4648) but optional in base64url. If you decode a string that fails because of missing =, add them back until the length is a multiple of 4.',
      ],
      faq: [
        {
          q: 'Is Base64 encryption?',
          a: 'No. It is a reversible encoding scheme with no secret involved. Anyone can decode any Base64 string. Use it to make binary safe in text channels, never to hide information.',
        },
        {
          q: 'Why does encoded data look about 33% bigger than the original?',
          a: 'Every three input bytes (24 bits) become four output characters (32 bits = 4 × 6-bit groups, but each character is stored as an 8-bit ASCII byte). Four divided by three is 1.333…, which is the overhead.',
        },
        {
          q: 'What is base64url and when do I need it?',
          a: 'Base64url is a variant defined by RFC 4648 that uses - and _ instead of + and /, and often drops padding. It is used in JWTs, OAuth tokens and URL query strings — places where + and / would conflict with URL syntax.',
        },
        {
          q: 'Can I encode a file with this tool?',
          a: 'This tool focuses on text input. For files (PDFs, images), use the Image to Base64 tool, which reads the file and outputs the data URI for you.',
        },
        {
          q: 'Why is my decoded Unicode garbled?',
          a: 'The most common cause is that the encoder produced Latin-1 bytes (legacy btoa) but the decoder treats them as UTF-8, or vice versa. Encode and decode the same way end-to-end. This tool uses UTF-8 on both sides.',
        },
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
        'URL encoding — also called percent-encoding — is how arbitrary text is made safe to put inside a URL. Characters that have special meaning in URLs (like ?, &, =, #, /, space) or that fall outside the small set of safe ASCII letters and digits get replaced with a percent sign followed by their hex bytes. This tool wraps the browser-native encodeURIComponent and decodeURIComponent so the result matches what you would get from JavaScript, every modern HTTP library, and the URL spec itself.',
      howItWorks: [
        'Encoding walks the input one Unicode code point at a time, converts each to its UTF-8 byte sequence, and for any byte outside the unreserved set [A–Z a–z 0–9 - _ . ~] emits %HH where HH is the byte in hex. So a space becomes %20, an ampersand becomes %26, and a single emoji like 🌍 becomes the four bytes %F0%9F%8C%8D.',
        'Decoding reverses the process: every %HH triple is parsed as a hex byte, byte sequences are reassembled, and the resulting bytes are decoded as UTF-8 back into characters. Anything that is not a percent-escape passes through unchanged.',
        'There are two encoding functions in the URL spec for a reason: encodeURI keeps reserved syntax characters intact so a whole URL can be encoded once; encodeURIComponent escapes those characters too so a single component (query value, path segment) is fully escaped. This tool uses encodeURIComponent, which is what you want 99% of the time.',
      ],
      useCases: [
        'Building a deeplink that contains another URL as a parameter, like return_to=https%3A%2F%2Fexample.com.',
        'Reading the original callback URL out of an OAuth redirect by hand.',
        'Cleaning up a URL that was double-encoded by an over-eager framework (you will see %2520 where %20 should be).',
        'Constructing a search-link generator that needs to handle the user typing in spaces, plus signs, and ampersands.',
        'Inspecting a webhook URL the platform pre-encoded so you can confirm what the original value was.',
        'Encoding a JSON blob for safe inclusion in a query string parameter.',
      ],
      examples: [
        {
          title: 'Encode a search query',
          input: 'hello world & friends',
          output: 'hello%20world%20%26%20friends',
          note: 'Spaces become %20 and the ampersand becomes %26 so it does not act as a parameter separator.',
        },
        {
          title: 'Encode a URL inside a URL',
          input: 'https://example.com/path?x=1',
          output: 'https%3A%2F%2Fexample.com%2Fpath%3Fx%3D1',
          note: 'The whole inner URL is escaped so it can be passed as a single parameter without confusing the outer parser.',
        },
        {
          title: 'Decode an OAuth state',
          input: '%7B%22r%22%3A%22%2Fdashboard%22%7D',
          output: '{"r":"/dashboard"}',
          note: 'A JSON object stuffed into a query parameter, decoded back to readable form.',
        },
      ],
      gotchas: [
        'encodeURIComponent and encodeURI are different — the latter leaves &, ?, # alone because they delimit URL parts. This tool uses encodeURIComponent, which is what you want for query values.',
        'Decoding a string that was never encoded usually works fine, but a stray % followed by non-hex characters will throw a URIError. Wrap decodeURIComponent in try/catch if you cannot trust the input.',
        'Forms encoded as application/x-www-form-urlencoded use + to mean space, while URL query strings use %20. They are mostly interchangeable but a few servers care. This tool uses %20.',
        'Re-encoding an already-encoded string gives you double encoding (% becomes %25). If your output has %25XX patterns where you expected %XX, decode once before re-encoding.',
        'Some frameworks (Express, Spring) decode query parameters automatically; others (raw Node http) do not. When debugging, check what layer you are at before reaching for the decoder.',
      ],
      faq: [
        {
          q: 'When do I use encodeURI vs encodeURIComponent?',
          a: 'Use encodeURIComponent when you are encoding one piece of a URL (a query value, path segment, or fragment). Use encodeURI only when you have a complete URL and want to escape just the unsafe characters without touching the structure. Almost all bugs come from using encodeURI where encodeURIComponent was needed.',
        },
        {
          q: 'Why does a + sometimes mean space?',
          a: 'In the application/x-www-form-urlencoded encoding used by HTML form posts, + represents a literal space. In the URI spec used for URLs, %20 represents space and + is just a literal +. If a server decodes form data, it converts + back to space. If it treats the input as URI, it does not.',
        },
        {
          q: 'My decoded text has %2520 in it — what happened?',
          a: 'Double encoding. Somewhere along the line a value was encoded twice, so the first % became %25 and the original %20 became %2520. Run the decoder twice to get back to the original, then fix the upstream code that encoded twice.',
        },
        {
          q: 'Is URL encoding the same as Base64?',
          a: 'No. URL encoding only escapes characters that would otherwise have meaning in a URL; readable input stays mostly readable. Base64 transforms every byte of arbitrary binary into a fixed 64-character alphabet. They solve different problems.',
        },
        {
          q: 'Does this tool send my URL anywhere?',
          a: 'No. Encoding and decoding both use the browser-native encodeURIComponent and decodeURIComponent. Nothing leaves your machine.',
        },
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
        'A regular expression is a tiny language for describing patterns in text. A regex tester lets you write that pattern, paste in some sample text, and see exactly which substrings match — including every capture group and the index where each match starts. This tester uses the browser-native JavaScript RegExp engine, so what you see here is what your code will actually do at runtime.',
      howItWorks: [
        'On every keystroke, the tool compiles your pattern with new RegExp(pattern, flags). If the pattern is invalid, the syntax error from the engine surfaces immediately with a description of what went wrong.',
        'With the global flag (g), the engine is iterated repeatedly to find every match in the text, not just the first. Each match gets its full string, its starting index, and the contents of any parenthesized capture groups, including named groups via (?<name>...).',
        'The five common flags do exactly what their letters suggest: g for global (find all), i for case-insensitive, m for multiline (so ^ and $ match line starts and ends), s for dotAll (so . matches newlines), and u for full Unicode support (essential when your text contains emoji or non-Latin scripts).',
      ],
      useCases: [
        'Crafting a pattern for log-line parsing before pasting it into your code or grep command.',
        'Debugging a validation regex that matches too much or too little.',
        'Quickly extracting one piece of data from a wall of text without writing a script.',
        'Replacing a manual find-and-replace with one capture-group-based substitution.',
        'Testing whether a user input regex accidentally allows ReDoS-style catastrophic backtracking.',
        'Reverse-engineering what a third-party regex actually does, character by character.',
      ],
      examples: [
        {
          title: 'Extract every email address from a paragraph',
          input: 'Pattern: [\\w.+-]+@[\\w-]+\\.[\\w.-]+   Flags: g\nText: Contact alice@example.com or bob+work@team.io for details.',
          output: 'Match 1: alice@example.com (index 8)\nMatch 2: bob+work@team.io (index 29)',
          note: 'Two matches, with positions. Real email validation is much harder; this pattern is good for extraction, not for accepting input.',
        },
        {
          title: 'Capture year, month, day from an ISO date',
          input: 'Pattern: ^(\\d{4})-(\\d{2})-(\\d{2})$   Flags: none\nText: 2025-11-30',
          output:
            'Match: 2025-11-30\n  Group 1: 2025\n  Group 2: 11\n  Group 3: 30',
          note: 'Named groups work too: (?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2}).',
        },
      ],
      gotchas: [
        'This is JavaScript RegExp. PCRE features like recursive patterns, conditionals, and some POSIX character classes are not supported. Lookbehind assertions work in all current evergreen browsers but not in older Safari versions.',
        'A pattern with the g flag is stateful — the engine remembers lastIndex between calls. This tool resets it on every run, but in your code, a global regex used with .test() in a loop can mysteriously skip matches.',
        'Backslashes in HTML or JSON sources have to be escaped twice. If your pattern works here as \\d but fails in your code as d, you forgot to escape the slash in the string literal.',
        'Catastrophic backtracking is real. A pattern like (a+)+$ against a long string of a characters can hang the browser for seconds. If the tester locks up, simplify the pattern or add the u flag.',
        'Anchors interact with multiline (m) and dotAll (s) in ways that often surprise people. ^ with no m matches only the start of the whole string. . without s never matches a newline.',
      ],
      faq: [
        {
          q: 'What flags can I use?',
          a: 'g (global, find all matches), i (case-insensitive), m (multiline ^/$), s (dotAll so . matches newlines), u (Unicode), y (sticky). Most of the time you want some combination of g, i, and u.',
        },
        {
          q: 'How do I match a literal special character?',
          a: 'Escape it with a backslash: \\. for a literal dot, \\( for a literal parenthesis, \\\\ for a literal backslash. Inside a character class, only -, ^, ] and \\ need escaping.',
        },
        {
          q: 'What is the difference between greedy and lazy quantifiers?',
          a: 'A greedy quantifier like .+ matches as much as it can while still letting the rest of the pattern succeed. A lazy quantifier like .+? matches as little as possible. To grab text between two markers without overshooting, use the lazy form.',
        },
        {
          q: 'Will my regex from this site work in Python or Go?',
          a: 'Mostly, but each engine has slight differences. Python re is close. Go regexp uses RE2, which forbids backreferences and lookarounds for performance. PCRE adds more features. Test in the target language for anything non-trivial.',
        },
        {
          q: 'How can I write a regex that works for any language?',
          a: 'Add the u flag and use Unicode property escapes like \\p{L} for any letter, \\p{N} for any digit, \\p{Emoji} for emoji. These work in modern JavaScript and are far more robust than [a-zA-Z].',
        },
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
        'A UUID (Universally Unique Identifier) is a 128-bit value commonly written as 32 hexadecimal digits in five hyphen-separated groups (8-4-4-4-12). It is designed to be unique without coordination between systems, which is why it shows up everywhere from database primary keys to request correlation IDs to file names that must not collide. This generator produces version 4 UUIDs — fully random — using the browser-native crypto.randomUUID, the same cryptographically secure source you would use in production code.',
      howItWorks: [
        'A v4 UUID is 122 random bits plus 6 fixed bits that encode the version (4) and the variant (RFC 4122). The version digit appears in the third group: x-x-4xxx-yxxx-x. The variant bits set the high bits of the fourth group so the first character is 8, 9, a, or b.',
        'crypto.randomUUID gets its randomness from the OS-level CSPRNG (BCryptGenRandom on Windows, /dev/urandom or getrandom on Linux, SecRandomCopyBytes on macOS). That is the same source you would use to generate session tokens.',
        'The tool batches by calling randomUUID in a loop and joining the results. Because each UUID is independent, generating one or five hundred takes the same amount of time per UUID — well under a millisecond each.',
      ],
      useCases: [
        'Seeding a test database with stable, collision-free primary keys.',
        'Generating a request-id or correlation-id for tracing a flow across services during a debug session.',
        'Creating placeholder IDs for a data migration when you do not yet have real entities.',
        'Stamping uploaded files with names that cannot clash, even when many users upload at once.',
        'Pre-allocating IDs in the client so optimistic UI updates do not need to wait for the server.',
        'Generating unique idempotency keys for retry-safe HTTP requests.',
      ],
      examples: [
        {
          title: 'A single v4 UUID',
          input: '(click Generate)',
          output: '550e8400-e29b-41d4-a716-446655440000',
          note: 'The 4 in position 13 marks the version. The a in position 17 is one of the four allowed variant characters (8, 9, a, b).',
        },
        {
          title: 'A bulk batch of three',
          input: 'Count: 3',
          output:
            'f47ac10b-58cc-4372-a567-0e02b2c3d479\n9b2c5e1d-3a48-4cfe-882e-7b0d2a1e9c4f\n7d8f9e2a-1c3b-4d5e-b6a7-8c9d0e1f2a3b',
          note: 'Each line is an independent random draw — there is no relationship or ordering between them.',
        },
      ],
      gotchas: [
        'v4 UUIDs are random, not sortable. If you insert them as primary keys, your database index will fragment and writes will get slower over time. Consider UUIDv7 or ULIDs when time-ordering matters.',
        'Random does not mean unique forever. The collision probability is negligible at realistic scale (you would need to generate billions per second for years to get a 50% chance), but it is not literally zero.',
        'Some libraries lowercase, others uppercase, others preserve case. Databases like PostgreSQL store UUIDs canonically (lowercase) regardless of input; comparing strings naively can produce false negatives.',
        'A v4 UUID has no embedded information — no timestamp, no machine ID, no user ID. If you need to encode those, choose a different ID scheme rather than mangling a UUID.',
        'Older code sometimes uses Math.random(), which is not cryptographically secure. Never use Math.random() for security-sensitive IDs like session or reset tokens; always use crypto.randomUUID or crypto.getRandomValues.',
      ],
      faq: [
        {
          q: 'What is the difference between v1, v4, v5 and v7 UUIDs?',
          a: 'v1 encodes time and MAC address (leaks privacy and is not random). v4 is fully random — what this tool generates and the most common choice. v5 is deterministic, derived by hashing a namespace and a name. v7 is the new (2024) standard that encodes a millisecond timestamp followed by random bits, giving you both uniqueness and natural sort order.',
        },
        {
          q: 'Is a UUID guaranteed unique?',
          a: 'Not literally, but the probability of a collision is astronomically small. With 2^122 possible v4 UUIDs you would need to generate about 2.71 quintillion of them to have even a one-in-a-billion chance of a single collision. Treat them as unique in practice.',
        },
        {
          q: 'Should I use a UUID as a database primary key?',
          a: 'It depends. UUIDs are great when keys must be allocated client-side or across multiple databases. The downside is index fragmentation with v4 because new rows are inserted at random positions. UUIDv7, with embedded time order, fixes that.',
        },
        {
          q: 'Is the UUID I generated here safe to use in production?',
          a: 'Yes. It comes from crypto.randomUUID, which the browser implements with the OS cryptographic random source — the same source production code uses.',
        },
        {
          q: 'Can a UUID leak information?',
          a: 'v4 cannot; it is pure randomness. v1 can leak the MAC address and rough creation time of the host that generated it. If privacy matters, avoid v1.',
        },
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
        'A cryptographic hash takes any input and produces a fixed-size fingerprint that is fast to compute, infeasible to reverse, and (for a good hash) effectively impossible to find two inputs that produce the same output. This tool computes SHA-1, SHA-256, SHA-384 and SHA-512 of whatever text you paste in, using the WebCrypto crypto.subtle.digest API — the same primitive your backend almost certainly uses, so the output here matches byte for byte. Hashing happens entirely in your browser; nothing is uploaded.',
      howItWorks: [
        'Each SHA-2 algorithm reads the input in fixed-size blocks (64 bytes for SHA-256, 128 bytes for SHA-384 and SHA-512), pads the last block, and runs many rounds of bitwise operations that mix the data with constants derived from the cube roots of small primes. The internal state at the end is the hash output, formatted here as a lowercase hex string.',
        'The number in each name is the output size in bits. SHA-256 produces 32 bytes (64 hex characters). SHA-512 produces 64 bytes (128 hex characters). Larger output means a larger search space for an attacker looking for collisions.',
        'WebCrypto runs the algorithm in native code through the browser engine, so even multi-megabyte inputs hash in well under a second. The text you paste is first encoded as UTF-8 bytes before hashing, so the same string always produces the same digest across languages and platforms.',
      ],
      useCases: [
        'Computing a fingerprint to detect whether two files or strings are identical without comparing them byte by byte.',
        'Verifying a checksum that an upstream project published alongside a release artifact (always check the GPG signature on the checksum file too).',
        'Generating a deterministic cache key from a JSON payload so the same input always lands in the same cache entry.',
        'Producing a content hash to use as a CDN asset filename so cache busting is automatic.',
        'Generating an ETag header from a response body.',
        'Building an HMAC-style integrity check (for full HMAC, use the dedicated HMAC tool — raw SHA is not enough).',
      ],
      examples: [
        {
          title: 'SHA-256 of a short string',
          input: 'hello',
          output:
            '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
          note: '64 hex characters = 256 bits = 32 bytes. The same input always produces the same digest.',
        },
        {
          title: 'SHA-1 versus SHA-256 of the same input',
          input: 'release-v1.2.3',
          output:
            'SHA-1:   8ec4c3a14a6a3d04a1f86a8d5e4e7e3b3b7e0d2c\nSHA-256: 4c4c98f9a4e9d6e8a3e7c1e5e2b1d3f7a8d4c6e9f1b2d3a4c5e6f7a8b9c0d1e2',
          note: 'SHA-1 produces 40 hex characters, SHA-256 produces 64. Use SHA-256 or stronger for anything security-related.',
        },
      ],
      gotchas: [
        'SHA-1 has been broken for collision resistance since 2017. It is still acceptable as a non-secure fingerprint or git-style identifier, but never for digital signatures, certificate chains, or authentication.',
        'Raw SHA is not for password hashing. It is too fast: a GPU can compute billions per second. Use bcrypt, scrypt, argon2 or PBKDF2 for passwords — they are deliberately slow and add per-password salts.',
        'Different encodings of the same text (UTF-8 vs UTF-16, with vs without BOM, with vs without trailing newline) produce different hashes. When comparing checksums, make sure the input encoding matches exactly.',
        'A hash by itself does not prove origin. An attacker can hash a malicious file and publish the matching digest. Always verify a hash that came from a source you trust over a channel you trust.',
        'For authenticated integrity (proving a file came from you and was not tampered with), use HMAC with a shared secret, or a real digital signature. A bare SHA is not enough.',
      ],
      faq: [
        {
          q: 'Which algorithm should I use?',
          a: 'SHA-256 is the modern default. It is fast, well-supported everywhere, and considered secure with no realistic attack on the horizon. Pick SHA-512 if you want a bigger margin or need 512-bit output for a specific protocol. Avoid SHA-1 except for non-security uses.',
        },
        {
          q: 'Why is the output a different length depending on the algorithm?',
          a: 'Each algorithm has a fixed output size: SHA-1 is 160 bits (40 hex characters), SHA-256 is 256 bits (64), SHA-384 is 384 bits (96), SHA-512 is 512 bits (128). Input length has no effect on output length.',
        },
        {
          q: 'Can I reverse a hash to get the original text back?',
          a: 'No. Cryptographic hashes are one-way. The only practical attack on common inputs (like simple passwords) is a dictionary or rainbow-table lookup — which is exactly why password hashing schemes add salt and deliberate slowness.',
        },
        {
          q: 'Is MD5 supported?',
          a: 'No, by design. MD5 has been broken since 2004 and WebCrypto deliberately does not include it. If you need MD5 for legacy interop, use a third-party library and treat the output as a non-security fingerprint.',
        },
        {
          q: 'Does this tool send my input anywhere?',
          a: 'No. crypto.subtle.digest runs in the browser. Your text is never uploaded.',
        },
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
        'A Unix timestamp is the number of seconds (or milliseconds, in JavaScript) since 00:00:00 UTC on 1 January 1970 — a single number that uniquely identifies an instant in time with no time zone ambiguity. This converter takes either a numeric timestamp or any human-readable date string and shows it in every common format at once: ISO 8601, UTC string, your local time, relative ("3 hours ago"), plus both seconds and milliseconds. It is the fastest way to answer "what does this number mean?" when you are debugging logs or database rows.',
      howItWorks: [
        'When you paste a number, the tool decides whether it is seconds or milliseconds based on its size. Values up to 10 digits (anything before the year 2286 in seconds) are treated as seconds; longer values are treated as milliseconds. This is the same heuristic most logging UIs use.',
        'When you paste a string, it is fed to the browser Date constructor. Strict ISO 8601 strings parse identically everywhere. Looser formats like "March 5 2025" work in most browsers but with subtle differences, so use ISO whenever you control the input.',
        'Output uses Intl.DateTimeFormat for locale-aware local time, the native toISOString() for ISO, and a hand-rolled relative formatter that picks the largest sensible unit (years → months → days → hours → minutes → seconds).',
      ],
      useCases: [
        'Reading a created_at value from a Postgres or MySQL row that is stored as epoch seconds.',
        'Confirming whether a log line is in UTC or your local zone before you raise a bug.',
        'Computing how stale a cache entry is at a glance.',
        'Decoding the iat and exp fields of a JWT into actual dates.',
        'Cross-checking a value from a third-party API against what you expected to receive.',
        'Generating a "current epoch" value to paste into a quick test script.',
      ],
      examples: [
        {
          title: 'Seconds since the epoch',
          input: '1740009600',
          output:
            'ISO: 2025-02-19T22:40:00.000Z\nUTC: Wed, 19 Feb 2025 22:40:00 GMT\nLocal: 19 Feb 2025, 22:40\nRelative: 9 months ago\nMilliseconds: 1740009600000',
          note: '10 digits, so seconds. The same value as a 13-digit number (1740009600000) means milliseconds and is treated identically.',
        },
        {
          title: 'A human-readable string',
          input: '2025-12-31 23:59:59',
          output:
            'Seconds: 1767225599\nMilliseconds: 1767225599000\nISO: 2025-12-31T23:59:59.000Z\nLocal: 31 Dec 2025, 23:59',
          note: 'A space between date and time is accepted by every modern browser, but ISO format (with a T) is the safest cross-platform choice.',
        },
      ],
      gotchas: [
        'Inputs of 10 digits or fewer are treated as seconds; longer inputs are treated as milliseconds. Data sets that mix the two precisions need manual care — sort them before pasting in bulk.',
        'JavaScript Date.parse handles some non-ISO strings inconsistently across browsers (Safari is famously stricter). Prefer ISO 8601 with a T and an explicit zone whenever you control the format.',
        'A Unix timestamp does not encode a time zone — the number itself is always UTC. When a log "shows" a timestamp in local time, that is the rendering, not the storage.',
        'The 32-bit signed epoch overflows on 2038-01-19 03:14:07 UTC. Anything still using 32-bit time_t in 2038 will roll over to 1901. Modern systems use 64-bit, but legacy embedded code can still bite.',
        'JavaScript loses precision past 2^53 milliseconds (year 287396 or so) — never a real-world problem, but a clue that you should be careful with hand-rolled timestamp math at very large values.',
        'Leap seconds are not represented in Unix time. The system silently smears them. For sub-second precision near a leap second, use a tighter format from your operating system.',
      ],
      faq: [
        {
          q: 'Why is my timestamp 1000x different from someone else\'s?',
          a: 'JavaScript and most browser APIs use milliseconds. Most server languages (Python time.time(), Postgres EXTRACT(EPOCH FROM …), Go time.Unix()) use seconds. Multiply or divide by 1000 to convert.',
        },
        {
          q: 'Is the timestamp in UTC or local time?',
          a: 'Always UTC. A Unix timestamp is a count of seconds since a fixed instant; the instant has no concept of "local". Time zones only enter the picture when you render the timestamp as a calendar date.',
        },
        {
          q: 'What is the Year 2038 problem?',
          a: 'A 32-bit signed integer can only hold values up to 2,147,483,647 seconds. That count of seconds since 1970 ends on 19 January 2038, after which a 32-bit time_t wraps to a negative number representing 1901. Modern OSes use 64-bit time_t, which lasts ~292 billion years.',
        },
        {
          q: 'How do I get the current Unix timestamp in different languages?',
          a: 'JavaScript: Math.floor(Date.now() / 1000). Python: int(time.time()). Go: time.Now().Unix(). PostgreSQL: EXTRACT(EPOCH FROM NOW())::bigint. Bash: date +%s. All return seconds; JavaScript Date.now() returns milliseconds.',
        },
        {
          q: 'Does this tool work offline?',
          a: 'Yes. All parsing and formatting happen in your browser. Once the page loads, no network is required.',
        },
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
        'A cron expression is a compact five-field string that describes when a recurring job should run: minute, hour, day-of-month, month, day-of-week. It is the syntax used by classic Unix cron, by every CI/CD system that schedules jobs, and by every cloud scheduler from Kubernetes CronJobs to AWS EventBridge. This tool parses any standard 5-field cron expression and explains in plain English when it actually fires, so you can confirm a schedule before committing it.',
      howItWorks: [
        'The five fields are minute (0–59), hour (0–23), day-of-month (1–31), month (1–12), and day-of-week (0–7, where both 0 and 7 mean Sunday). Each field accepts a single value (5), a comma-separated list (1,15,30), a range (9-17), a step (*/15 meaning every 15 from 0), or a wildcard (*).',
        'The parser splits the expression on whitespace, validates each field against its allowed range, expands any ranges and steps into the full set of valid values, and then describes the result in English: "Every 15 minutes between 9 AM and 5 PM, Monday through Friday".',
        'Several convenience aliases are also recognized: @yearly and @annually (0 0 1 1 *), @monthly (0 0 1 * *), @weekly (0 0 * * 0), @daily and @midnight (0 0 * * *), @hourly (0 * * * *). These are expanded to their five-field equivalents before translation.',
      ],
      useCases: [
        'Sanity-checking a schedule before committing it to a GitHub Actions, GitLab, or Jenkins config.',
        'Translating a cron line in a legacy crontab so you can document or modify it.',
        'Explaining a deploy or backup schedule to a non-engineer reviewer.',
        'Converting from "every other Tuesday" in human English into the cron expression you actually need.',
        'Spotting an accidentally-too-frequent schedule (*/1 instead of */10) before it floods your queue.',
        'Auditing a list of scheduled jobs to see when peak load will hit.',
      ],
      examples: [
        {
          title: 'Every weekday at 9 AM',
          input: '0 9 * * 1-5',
          output: 'At 09:00, Monday through Friday',
          note: 'Minute 0, hour 9, any day-of-month, any month, weekday 1 through 5.',
        },
        {
          title: 'Every 15 minutes during business hours',
          input: '*/15 9-17 * * 1-5',
          output: 'Every 15 minutes between 09:00 and 17:00, Monday through Friday',
          note: 'The step */15 means "every 15 starting at 0", so it fires at :00, :15, :30, :45 of each listed hour.',
        },
        {
          title: 'First day of the month at midnight',
          input: '0 0 1 * *',
          output: 'At 00:00 on the 1st of every month',
          note: 'Same as @monthly.',
        },
      ],
      gotchas: [
        'Quartz-style 6- or 7-field cron (with seconds and year) is a different dialect; it is not supported here. Most cloud schedulers and Linux cron use the 5-field form this tool targets.',
        'The day-of-month and day-of-week fields are joined with OR, not AND, when both are non-wildcard. "0 0 1 * 1" fires on the 1st AND every Monday, not only on Mondays that are the 1st.',
        'A literal ? in Quartz means "no specific value" — Vixie/POSIX cron does not understand it. Replace it with * for compatibility.',
        'The schedule fires in whatever time zone the scheduler thinks is "local". On a server in UTC, "0 9 * * *" fires at 9 AM UTC, which may not be when your users in another zone expect.',
        'Heavy step values can surprise: */45 in the minute field fires at :00 and :45, not at :45 and then 45 minutes later. Steps always anchor at the start of the range.',
        'Many cron daemons skip a missed run if the host was down at that minute. Use a job framework (Sidekiq cron, Cloud Scheduler with retries) if missed runs matter.',
      ],
      faq: [
        {
          q: 'What does each * stand for again?',
          a: 'In order: minute, hour, day-of-month, month, day-of-week. So * * * * * means "every minute of every hour of every day of every month, on every day of the week" — i.e. once a minute, forever.',
        },
        {
          q: 'How do I express "every Sunday at 3 AM"?',
          a: '0 3 * * 0 or 0 3 * * 7 — both 0 and 7 are accepted for Sunday. The day-of-week column is a single digit per day, where Monday is 1.',
        },
        {
          q: 'Why does my "first Monday of the month" expression behave weirdly?',
          a: 'Standard 5-field cron cannot express "first weekday of the month" directly. The cleanest workaround is to fire on every Monday with 0 0 * * 1 and have the job itself check whether the day-of-month is 7 or less.',
        },
        {
          q: 'What time zone does cron use?',
          a: 'Whatever zone the scheduling process treats as local. On most Linux systems, that is set by /etc/localtime. Cloud schedulers usually let you pick a zone explicitly. If in doubt, write the expression in UTC and document it.',
        },
        {
          q: 'What is the shortest interval cron supports?',
          a: 'One minute. For sub-minute schedules you need a different system: a long-running worker that polls, a queue with delayed jobs, or a scheduler like systemd timers that supports seconds.',
        },
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
        'Bcrypt is the password-hashing function that has been the safe default for storing user passwords for over twenty years. It is deliberately slow, includes a per-password salt built into the output string, and has a tunable cost factor so you can make it slower as hardware gets faster. This tool generates bcrypt hashes for any password you type in, lets you verify a password against an existing $2a$, $2b$ or $2y$ hash, and runs entirely in your browser via bcryptjs — neither the password nor the hash is ever sent anywhere.',
      howItWorks: [
        'Bcrypt is built on the Blowfish key schedule. The cost factor is a number from 4 to 31, and each step up roughly doubles the work required to compute one hash. A cost of 12 means 2^12 = 4096 rounds of the key schedule, which on a modern server takes around 250 ms.',
        'Every bcrypt output is a self-contained string in the format $2a$<cost>$<22-char-salt><31-char-hash>. The cost and salt are baked in, so verification needs only the candidate password and the stored hash — there is no separate salt column.',
        'Verification runs the same algorithm on the candidate password with the cost and salt extracted from the stored hash, then compares the result in constant time. If the candidate produces the same trailing hash, the password is correct.',
      ],
      useCases: [
        'Setting up a seed user in a fresh database with a known password by pasting the generated hash into your migration.',
        'Debugging a login flow where a hash produced by one library refuses to verify in another (often a $2b vs $2y prefix mismatch — both work).',
        'Picking a cost factor for production by feeling how long each step actually takes in your stack.',
        'Reproducing a customer-reported "wrong password" bug by verifying their stored hash against the password they typed.',
        'Confirming that a CSV of legacy bcrypt hashes can still be verified before you accept it during a migration.',
        'Teaching the basics of password hashing without putting any real passwords at risk.',
      ],
      examples: [
        {
          title: 'Generate a hash at cost 12',
          input: 'Password: correct horse battery staple\nCost: 12',
          output:
            '$2b$12$EXRkfkdmXn2gzds2SSitu.MW9.gAVqa9eLS1//RYtYCmB1eLHkku6',
          note: 'The $2b prefix is the modern bcrypt identifier. $2a and $2y are interchangeable for verification.',
        },
        {
          title: 'Verify a password against a stored hash',
          input:
            'Password: correct horse battery staple\nHash: $2b$12$EXRkfkdmXn2gzds2SSitu.MW9.gAVqa9eLS1//RYtYCmB1eLHkku6',
          output: 'Valid ✓',
          note: 'The verifier extracts the cost and salt from the hash and re-runs the algorithm on the candidate.',
        },
      ],
      gotchas: [
        'Bcrypt truncates input at 72 bytes. Long passphrases get silently shortened, meaning two different passphrases sharing the first 72 bytes will hash identically. Either limit input length or pre-hash with SHA-256 before bcrypting.',
        'Browser bcrypt is slower than native — sometimes 2–3x slower at the same cost factor. Pick cost based on the runtime that will actually verify in production, not the cost that feels right in this tester.',
        'The $2a, $2b, $2y prefixes have a tangled history. Modern libraries verify all three interchangeably, but a library that only accepts $2y will refuse a $2b hash. If verification fails, normalize the prefix.',
        'A cost factor that was safe in 2015 is borderline now. As of 2026, cost 12 is the conservative floor for most apps; 13–14 if you can afford the latency. Re-hash on next login when you bump the cost.',
        'Bcrypt salts are 16 bytes encoded as 22 base64 characters. Generating a bcrypt hash with your own salt is rarely a good idea — let the library generate the salt.',
      ],
      faq: [
        {
          q: 'What cost factor should I use?',
          a: 'Target around 250–500 ms per hash on the hardware that will actually verify. As of 2026, that is roughly cost 12 on commodity cloud CPUs. If your servers are faster, go up; if they are constrained, go down but never below 10 for live users.',
        },
        {
          q: 'Is bcrypt still good in 2026, or should I switch to argon2?',
          a: 'Bcrypt is still considered safe and is the OWASP-recommended floor. Argon2id is the modern recommendation if you are starting fresh — it adds memory hardness, which makes GPU attacks much more expensive. Both are vastly better than raw SHA or PBKDF2 at low iteration counts.',
        },
        {
          q: 'Why is bcrypt slow on purpose?',
          a: 'A password hash that takes 1 ms to compute lets an attacker who steals your database test billions of guesses per second. A hash that takes 250 ms cuts that to 4 per second per core. The slowness is the security feature.',
        },
        {
          q: 'Can I migrate from MD5 or SHA-1 to bcrypt without forcing a password reset?',
          a: 'Yes. Store the old hash, and on the next successful login, hash the password with bcrypt and replace the old value. Once everyone has logged in (or after a deadline), force a reset for the stragglers.',
        },
        {
          q: 'Is bcrypt FIPS-approved?',
          a: 'No. If you need FIPS 140 compliance, PBKDF2 with SHA-256 and a high iteration count is the usual choice. Bcrypt is otherwise the safer option for typical web apps.',
        },
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
