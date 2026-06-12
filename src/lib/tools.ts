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
        'Parses any CSS color (HEX, shorthand HEX, rgb(), hsl()) and converts it to all three notations at once, with a live swatch so you can visually verify the result. Useful for translating designer hand-offs into CSS variables, building tint/shade scales, or just confirming what `hsl(140, 100%, 50%)` actually looks like.',
      howItWorks: [
        'On every change, the input is normalized into a canonical RGB triple. HEX is decoded directly; rgb() and hsl() are parsed with permissive regexes that tolerate whitespace, percent vs absolute values, and the older comma-separated forms.',
        'From RGB, conversion to HSL uses the standard CSS color space formula: the dominant channel determines the hue, max minus min gives saturation, and the average of max and min gives lightness. Rounding to integer percentages keeps the output readable, at the cost of a tiny precision loss on round-trips.',
        'The swatch is just a div whose background is the parsed color, rendered using the browser\'s native CSS parser as a final sanity check. If the swatch looks wrong, the input was wrong.',
      ],
      useCases: [
        'Translating a designer\'s HEX into HSL so you can build a tint/shade scale by varying lightness.',
        'Quickly checking what `rgb(0, 255, 136)` looks like without opening a design tool.',
        'Normalizing color values between a Figma export and a CSS variable file.',
        'Picking a complementary color by rotating the hue 180° in HSL.',
        'Confirming that a hex code in a brand guidelines doc matches the rgb() you have in your stylesheet.',
        'Debugging why a CSS variable looks slightly off — usually a hex/rgb round-trip rounding issue.',
      ],
      examples: [
        {
          title: 'HEX to HSL',
          input: '#00ff88',
          output: 'rgb(0, 255, 136)\nhsl(152, 100%, 50%)',
          note: 'The bright green used as this site\'s accent color. HSL makes "same hue, darker" easy: change the 50% to 35%.',
        },
        {
          title: 'Shorthand HEX',
          input: '#abc',
          output: '#aabbcc\nrgb(170, 187, 204)\nhsl(210, 25%, 73%)',
          note: 'Three-digit hex expands each digit (a → aa). #abc and #aabbcc are identical.',
        },
      ],
      gotchas: [
        'HSL conversion rounds to integer percentages, so a perfect round-trip back to the original RGB is not guaranteed — you may see #00ff88 → hsl(152, 100%, 50%) → rgb(0, 255, 137), one off.',
        'Alpha (transparency) is parsed as part of the input recognition but the conversion output focuses on the opaque color. To work with alpha precisely, use a dedicated rgba/hsla form.',
        'HSL hue is on a 0–360° wheel — 0 and 360 are both red. Some tools display 0–100 for hue (Photoshop-style); those values are not interchangeable with CSS hsl().',
        'Saturation and lightness in HSL are not perceptually uniform. Halving the lightness does not produce a color half as bright to the human eye. For perceptual color work, use OKLCH (modern CSS) instead of HSL.',
        'Web browsers historically disagreed on edge cases in rgb() parsing. The CSS Color Module Level 4 specifies the canonical behavior; modern browsers all agree, but be careful about legacy stylesheets.',
      ],
      faq: [
        {
          q: 'What is the difference between HSL and HSB / HSV?',
          a: 'HSL has lightness on a 0–100 scale where 50 is the pure color, 0 is black and 100 is white. HSB/HSV has brightness where 0 is black and 100 is the pure color. Photoshop uses HSB; CSS uses HSL. The hue and saturation share the same conventions.',
        },
        {
          q: 'Why does hex sometimes have 4 or 8 digits?',
          a: 'Four-digit hex (#rgba) is shorthand for an RGBA color with one digit per channel. Eight-digit hex (#rrggbbaa) is the long form. The last two digits are alpha — 00 = transparent, ff = opaque.',
        },
        {
          q: 'What is OKLCH and should I use it?',
          a: 'OKLCH is a perceptually uniform color space introduced in CSS Color Level 4. Equal numeric steps in OKLCH look like equal visual steps, which makes it much better than HSL for designing color systems. Modern browsers support oklch() natively.',
        },
        {
          q: 'My HSL conversion is slightly different from someone else\'s. Why?',
          a: 'Different tools round at different stages. Some round to nearest integer at each step; some round only at the end. Differences of 1° in hue or 1% in saturation/lightness are common and visually imperceptible.',
        },
        {
          q: 'Does this work for named CSS colors like "tomato"?',
          a: 'Named color support is not currently implemented. Use the hex equivalent (tomato = #ff6347) or paste the rgb() form.',
        },
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
        'Pastes a JSON sample and emits one or more TypeScript `export interface` declarations that describe its shape. Nested objects become their own interfaces named after the property they belong to; arrays of mixed types collapse into a union; primitives map to the natural TypeScript counterpart. Useful for bootstrapping types from an API response when there is no OpenAPI spec, or for catching schema drift by re-running against a fresh sample and diffing.',
      howItWorks: [
        'The tool parses the JSON, walks the resulting JavaScript value, and recursively visits each property. For objects, it generates an interface with the property name capitalized; for arrays, it inspects the items and produces an element type; for primitives, it maps to `string`, `number`, `boolean` or `null`.',
        'Arrays of objects with consistent shapes share a single interface. Arrays of mixed primitive types become a union (`(string | number)[]`). Nested arrays preserve their depth.',
        'The output is plain TypeScript text — copy and paste into your project. The inferred types are a starting point: real schemas often have optional fields that happen to be present in your sample, or enums that look like plain strings.',
      ],
      useCases: [
        'Bootstrapping types from an API response when there is no OpenAPI spec or backend code to mirror.',
        'Catching schema drift by re-running against a fresh sample and diffing the generated interfaces.',
        'Converting a fixture file into a typed import for tests so the test data matches the contract.',
        'Generating types for a webhook payload you have a sample of but no documentation.',
        'Documenting a legacy API by inferring types from real production responses.',
        'Building a starting point for a Zod / io-ts / valibot schema by translating the TypeScript output by hand.',
      ],
      examples: [
        {
          title: 'A nested user object',
          input: '{"id":42,"email":"jane@example.com","roles":["admin","editor"],"profile":{"name":"Jane","age":30}}',
          output:
            'export interface Root {\n  id: number;\n  email: string;\n  roles: string[];\n  profile: Profile;\n}\n\nexport interface Profile {\n  name: string;\n  age: number;\n}',
          note: 'Two interfaces — one for the root, one for the nested profile. Names are derived from the property path.',
        },
        {
          title: 'Mixed array',
          input: '{"items":[1, "two", 3]}',
          output: 'export interface Root {\n  items: (number | string)[];\n}',
          note: 'Arrays of mixed primitives become unions. For mixed objects, you may want to use discriminated unions by hand.',
        },
      ],
      gotchas: [
        'Types are inferred from a single sample. A field that happens to be `null` in your sample will type as `null` — adjust to `string | null` (or whatever the real type is) when the field is sometimes present.',
        'Missing-but-actually-optional fields are not marked with `?`. If your API returns a property in 70% of cases, the tool cannot tell from one sample; mark optional fields by hand.',
        'Identical-looking nested objects get separate interfaces, not deduped. If you have a `User` shape repeated in three places, rename and reuse by hand.',
        'Numeric literal types are NOT inferred. A field with value `42` types as `number`, not `42`. For enums or discriminated unions, refine manually.',
        'Date strings type as `string` because JSON has no date type. If you parse them client-side, add a runtime guard and re-type to `Date`.',
        'For very large JSON samples (hundreds of nested levels), the generated interface tree can be unwieldy. Consider trimming the sample to the parts you actually use.',
      ],
      faq: [
        {
          q: 'Does this generate JSDoc, Zod or io-ts schemas?',
          a: 'No — only plain TypeScript interfaces. To get a runtime validator, run the output through a tool like ts-to-zod, or use a dedicated JSON-Schema-to-Zod pipeline.',
        },
        {
          q: 'How do I handle optional fields?',
          a: 'The tool cannot infer optionality from a single sample. Provide multiple samples and diff the generated interfaces, then merge by adding `?` to fields that appear inconsistently.',
        },
        {
          q: 'Are numbers always `number`?',
          a: 'Yes. TypeScript has no separate integer/float types — `number` covers both. If you want to enforce integer constraints, use branded types or a runtime validator.',
        },
        {
          q: 'What about deeply nested generic responses (e.g., GraphQL)?',
          a: 'It works, but the generated nesting can be deep. GraphQL responses often have specific tooling (graphql-codegen) that produces cleaner types directly from the schema.',
        },
        {
          q: 'Does my JSON get uploaded?',
          a: 'No. The conversion runs entirely in your browser. No payload leaves the tab.',
        },
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
        'Compares two text blobs line by line using the standard longest-common-subsequence (LCS) algorithm — the same approach git uses internally — and renders the result with added, removed and unchanged lines color-coded. Useful for quickly comparing two configs, two JSON payloads, two API responses, or two versions of any text file without opening a git client. Runs entirely in your browser.',
      howItWorks: [
        'The diff algorithm finds the longest common subsequence between the two inputs, then walks both texts marking lines as additions (only in the right), deletions (only in the left) or unchanged.',
        'The rendered output uses the unified format that has been the convention since the original Unix diff: `-` prefix for removed lines, `+` prefix for added lines, no prefix for unchanged. Side-by-side rendering pairs the two columns visually.',
        'For long files, only the lines that change (plus a small amount of context above and below) are shown. Long runs of unchanged code are collapsed for readability.',
      ],
      useCases: [
        'Comparing two versions of a config file when you do not want to open a git client.',
        'Spotting what changed in a copy-pasted JSON response between two requests.',
        'Reviewing an LLM\'s suggested edit before you apply it.',
        'Comparing two .env files to see what differs between dev and prod.',
        'Confirming that a refactor preserved structure by diffing the formatted output.',
        'Auditing a third-party-supplied config update against your existing version.',
      ],
      examples: [
        {
          title: 'A small config change',
          input: 'Left:\nport=8080\nhost=localhost\ndebug=false\n\nRight:\nport=8080\nhost=0.0.0.0\ndebug=true',
          output:
            '  port=8080\n- host=localhost\n+ host=0.0.0.0\n- debug=false\n+ debug=true',
          note: 'Two lines changed. The unchanged port line is preserved as context.',
        },
      ],
      gotchas: [
        'Diffs are line-based. A single-character change in a long line shows the whole line as add + delete. For prose with long lines, this can be noisy — consider a word-level diff tool for that.',
        'Whitespace matters by default. Two lines that differ only by trailing whitespace are reported as changed. Strip trailing whitespace if you do not care.',
        'Reordered identical lines produce a delete + add pair, even though the content is unchanged at the file level. Sort both inputs first if order does not matter for your case.',
        'The algorithm is O(N×M) in the worst case for inputs with no shared lines. For very large files (tens of thousands of lines), use git diff or a dedicated CLI tool.',
        'Binary content (paste of a PDF, image bytes) will produce nonsense output. The tool is for text only.',
      ],
      faq: [
        {
          q: 'Is the output the same as `git diff`?',
          a: 'Conceptually yes. Both use LCS-based diff. The output format and context-line count may differ slightly, but the conclusions about what changed will match.',
        },
        {
          q: 'Does the tool support word-level or character-level diff?',
          a: 'Not currently — diffs are line-based. For prose where word-level diff matters, tools like wdiff or diff-match-patch are better suited.',
        },
        {
          q: 'How big can the inputs be?',
          a: 'Comfortable up to ~10,000 lines per side. Beyond that, browsers can stall during layout because the rendered diff has many DOM nodes. For larger files, use a CLI.',
        },
        {
          q: 'Can I ignore whitespace?',
          a: 'Not yet. Trim trailing whitespace and normalize line endings in your inputs first if needed. CRLF vs LF differences will show as every line being changed — convert both to LF before comparing.',
        },
        {
          q: 'Is my text uploaded anywhere?',
          a: 'No. The diff runs entirely in your browser.',
        },
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
        'Tokenizes any string on word boundaries — camel humps, dashes, underscores, whitespace, even punctuation — then recomposes it in every common case style at once: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, sentence case, UPPERCASE and lowercase. Useful when porting an identifier between languages with different naming conventions, or when generating a slug from a human-readable title.',
      howItWorks: [
        'The tool splits the input into "words" by detecting transitions: a lowercase-to-uppercase transition (camel hump), an underscore or dash, a space, a punctuation mark. Numbers are kept attached to the preceding word.',
        'The resulting word list is then rejoined according to each case style: camelCase joins with the first word lowercased and the rest capitalized; snake_case joins with underscores and all lowercase; CONSTANT_CASE same but uppercase; kebab-case joins with dashes; Title Case capitalizes each word; sentence case capitalizes only the first.',
        'Acronyms are detected when multiple uppercase letters appear consecutively. `parseHTTPRequest` tokenizes as `parse / HTTP / Request`, which round-trips cleanly back to camel form.',
      ],
      useCases: [
        'Renaming an identifier across languages where conventions differ (JavaScript camelCase → Python snake_case → Ruby snake_case → C# PascalCase).',
        'Generating a slug from a human-readable title for a URL.',
        'Building constant names from prose for an enum (`User Active` → `USER_ACTIVE`).',
        'Converting a CSV column header to a database column name (`First Name` → `first_name`).',
        'Producing CSS class names from designer-supplied component names.',
        'Normalizing a hand-typed identifier before using it in code generation.',
      ],
      examples: [
        {
          title: 'Multiple targets from one source',
          input: 'parseHttpRequest',
          output:
            'camelCase:     parseHttpRequest\nPascalCase:    ParseHttpRequest\nsnake_case:    parse_http_request\nCONSTANT_CASE: PARSE_HTTP_REQUEST\nkebab-case:    parse-http-request\nTitle Case:    Parse Http Request',
          note: 'Acronyms like HTTP are normalized to title case to avoid `parseHTTPRequest` → `parse_h_t_t_p_request`.',
        },
        {
          title: 'From prose',
          input: 'User First Name Required',
          output:
            'camelCase:     userFirstNameRequired\nCONSTANT_CASE: USER_FIRST_NAME_REQUIRED\nslug:          user-first-name-required',
          note: 'Useful for generating identifiers from form field labels or i18n keys.',
        },
      ],
      gotchas: [
        'Acronym handling is heuristic. `XMLParser` could tokenize as XML / Parser or as X / M / L / Parser depending on the rules. Most tools (including this one) treat runs of uppercase as a single token.',
        'Unicode word boundaries get tricky. Greek letters in identifiers, CJK text mixed with Latin, or emoji can produce unexpected tokenizations. For non-Latin scripts, check the output before relying on it.',
        'Numbers attach to whichever side the input had them on. `oauth2Provider` tokenizes as `oauth2 / Provider`, so the snake form is `oauth2_provider`, not `o_auth_2_provider`.',
        'Some target conventions reserve certain words. Python avoids `class` as an identifier; Java avoids `default`. The case converter does not flag these — you have to check.',
        'Round-tripping is not always perfect. Convert `camelCase` to `snake_case` and back, and you get the original; convert to `kebab-case` and back to camel and you do too. But if the original had an unusual structure (`HTTPServer`), expect minor casing drift.',
      ],
      faq: [
        {
          q: 'How does it handle acronyms like HTTP, URL, ID?',
          a: 'Runs of consecutive uppercase letters are treated as a single word. So `parseHTTPRequest` becomes three tokens (parse, HTTP, Request), and the snake form is `parse_http_request`, not `parse_h_t_t_p_request`.',
        },
        {
          q: 'Which case is best for which language?',
          a: 'JavaScript / Java identifiers: camelCase. Python / Ruby / Rust functions: snake_case. C# / Go exported / TypeScript types: PascalCase. CSS classes / HTML attributes / URLs: kebab-case. Constants: CONSTANT_CASE. Database columns: snake_case (universally).',
        },
        {
          q: 'Can I convert just to a slug?',
          a: 'kebab-case is essentially a slug. For more aggressive slug generation (Unicode normalization, removing stop words, ensuring URL safety), use the dedicated Slug Generator tool.',
        },
        {
          q: 'Does this work for non-English text?',
          a: 'Mostly. Latin-script languages with accents work fine. CJK and right-to-left scripts may not tokenize as expected — these languages typically do not have "case" the same way English does.',
        },
        {
          q: 'Is my input uploaded?',
          a: 'No. Case conversion runs entirely in your browser.',
        },
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
        'Queries the major public DNS-over-HTTPS resolvers (Cloudflare 1.1.1.1, Google 8.8.8.8) for any record type you pick — A, AAAA, MX, TXT, NS, CNAME, SOA, CAA, SRV, PTR — and shows each answer with its TTL. Useful when debugging email deliverability, propagation after a record change, CDN routing, or just confirming that a domain points where you think it does.',
      howItWorks: [
        'A DNS-over-HTTPS query is an HTTPS GET or POST to the resolver carrying the question (hostname + record type) in either binary wire format or JSON. The resolver does the actual recursive resolution and returns the answer set.',
        'For each record in the answer, the tool shows the data and the TTL. The TTL value you see is the time-to-live the upstream resolver caches the record for, not necessarily the authoritative TTL — once a record has been in cache for 30 seconds, the TTL returned to you is 30 seconds less than the authoritative one.',
        'MX records carry a priority (preference) number. SRV records carry priority, weight, port and target. The tool surfaces these alongside the data so you do not have to know the wire format by heart.',
      ],
      useCases: [
        'Confirming that an SPF or DKIM TXT record is published before mail starts bouncing.',
        'Verifying that a DNS change has propagated past local resolver caches.',
        'Tracing why a domain resolves to a different IP for your client than for production.',
        'Checking the CAA record set before requesting a certificate, so you do not get an unexpected refusal.',
        'Auditing nameserver delegation when you switch DNS providers.',
        'Spotting a stray AAAA record pointing at an unmanaged IPv6 address.',
      ],
      examples: [
        {
          title: 'Resolve MX for a domain',
          input: 'example.com, type MX',
          output:
            '10  mx1.example-mail.com.\n20  mx2.example-mail.com.',
          note: 'Lower priority numbers are preferred. 10 is tried before 20.',
        },
        {
          title: 'Read an SPF record',
          input: 'example.com, type TXT',
          output:
            '"v=spf1 include:_spf.google.com ~all"\n"google-site-verification=…"',
          note: 'TXT records often contain multiple unrelated strings. The first quoted string is the actual value; everything from "google-site" onward is verification metadata.',
        },
      ],
      gotchas: [
        'TTLs returned here reflect upstream resolver caching, not your authoritative TTL. A fresh authoritative answer can still appear with a short TTL because the resolver dropped most of the cached value.',
        'CNAMEs at a zone apex (example.com itself, not www.example.com) are illegal per RFC 1034. Use ALIAS/ANAME records if your DNS provider offers them, or a flat A record.',
        'Negative answers (NXDOMAIN, NOERROR with no records) are also cached — by default for 5 minutes. A failed lookup right after a delete may still show the old record from cache.',
        'EDNS Client Subnet (ECS) can cause different resolvers to return different IPs because the answer is region-specific. If your customer in Singapore is hitting a US edge node, ECS may be why.',
        'A TXT record longer than 255 characters is split into multiple quoted strings on the wire. Resolvers concatenate them — but some parsers see only the first chunk. Long DKIM keys are the common failure.',
        'DNS is not always immediately consistent. A record can be updated authoritatively but still take TTL time to propagate. Lowering the TTL before a planned change is the textbook workaround.',
      ],
      faq: [
        {
          q: 'Why does my DNS change show up here but not on my laptop?',
          a: 'Your laptop is using a different resolver (often your ISP or your router), which has its own cache. This tool queries 1.1.1.1 and 8.8.8.8 directly. Wait until the TTL on the old record expires, or flush your local cache.',
        },
        {
          q: 'What is the difference between A and AAAA?',
          a: 'A records map a hostname to an IPv4 address (4 bytes). AAAA records map to an IPv6 address (16 bytes). A modern host has both; clients pick which one to use based on Happy Eyeballs.',
        },
        {
          q: 'Why are there multiple NS records?',
          a: 'A zone needs at least two nameservers for redundancy. The order of NS records returned varies (round-robin) — there is no "primary" from the client\'s perspective.',
        },
        {
          q: 'Can I do a reverse DNS lookup?',
          a: 'Yes — query the PTR record for the special arpa form of the IP (e.g., 8.8.8.8 → 8.8.8.8.in-addr.arpa). Most modern resolvers also accept the IP directly for convenience.',
        },
        {
          q: 'Does this support DNSSEC validation?',
          a: 'Both Cloudflare and Google resolvers validate DNSSEC by default — if a domain fails DNSSEC, you will get a SERVFAIL. This tool does not surface DNSSEC status separately; use dig +dnssec for that.',
        },
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
        'Opens a TLS connection to port 443 of any host you point it at and reports the leaf certificate the server presents. You get subject, issuer, validity window, days remaining, subject alternative names and a colored expiry badge — green if there is more than two weeks of validity left, amber under two weeks, red if the cert has already expired. The actual TCP/TLS handshake runs from our edge function, not your browser, because browsers cannot speak raw TLS to arbitrary hosts.',
      howItWorks: [
        'When you submit a hostname, an edge function opens a TCP socket to host:443, performs a TLS handshake with SNI set to that hostname, captures the leaf certificate from the ServerHello, and closes the connection without sending any application data.',
        'The leaf cert is parsed with a real X.509 parser to extract the standard fields. Validity is compared against the current server time to compute days remaining. Subject alternative names are pulled from the SAN extension because the CN field is legacy.',
        'No payload is sent over the connection. Logs record only the hostname, the resolved IP, and the result — useful for rate-limiting and abuse prevention, not for tracking certificate contents.',
      ],
      useCases: [
        'Setting up a renewal reminder before a cert silently expires at 03:00 on a Sunday and pages you.',
        'Confirming a freshly issued cert covers the SANs you actually asked for.',
        'Spotting a misconfigured load balancer that is still serving the old cert after rotation.',
        'Verifying that a CDN edge node is serving the same cert as your origin.',
        'Cross-checking the SHA-256 fingerprint your monitoring expects (certificate pinning).',
        'Auditing a portfolio of domains for upcoming expiries without writing a script.',
      ],
      examples: [
        {
          title: 'Healthy certificate',
          input: 'example.com',
          output:
            'Subject: CN=example.com\nIssuer: CN=R3, O=Let\'s Encrypt\nValid: 2026-01-15 → 2026-04-15\nDays left: 67 (green)\nSAN: example.com, www.example.com',
          note: 'The colored badge gives an at-a-glance "do I need to worry" signal.',
        },
        {
          title: 'About to expire',
          input: 'staging.example.com',
          output: 'Days left: 8 (amber) — renew this week.',
          note: 'Real automation: pair with a cron-driven check and alert when amber turns red.',
        },
      ],
      gotchas: [
        'This checks the leaf certificate, not the full chain of trust. A cert can be perfectly valid here but rejected by clients with a stricter root store (older Java, embedded devices, some Linux distros).',
        'SNI is sent — virtual-hosted servers pick the cert based on the hostname you type, so a typo can result in inspecting the wrong cert (often the platform default).',
        'Hosts that require a client certificate, mTLS, or have IP allow-listed will refuse the connection. The error message is generic on purpose; do not interpret connection failures as cert problems.',
        'A cert can list a hostname in SAN without that hostname actually resolving to the server. The check confirms what the cert says, not whether DNS agrees with it.',
        'Wildcard certificates (*.example.com) cover one level of subdomain only — *.example.com does not cover deep.sub.example.com. The tool shows the wildcard literally; interpret accordingly.',
      ],
      faq: [
        {
          q: 'Does this work for HTTPS hosts on non-standard ports?',
          a: 'The tool defaults to port 443. If you need to check a TLS endpoint on a different port (8443, 4443), specify host:port. The handshake works the same; only the connection target changes.',
        },
        {
          q: 'How is this different from `openssl s_client`?',
          a: 'It does roughly what openssl s_client -connect host:443 -servername host would, then pretty-prints the result. For interactive certificate debugging on an internal host, openssl is more flexible. For a quick check from outside your network, this is faster.',
        },
        {
          q: 'Why does the expiry show a different date than my CA dashboard?',
          a: 'CA dashboards usually display issuance and renewal dates. The cert itself carries notBefore and notAfter, and the server may not have rotated to a newly-issued cert yet. This tool reads what the server is actually serving right now.',
        },
        {
          q: 'Does it warn about weak signatures or short keys?',
          a: 'The X.509 decoder tool surfaces the signature algorithm and key length. SSL Check focuses on validity and naming. For a full security grade (TLS versions accepted, cipher suites, OCSP stapling), use SSL Labs.',
        },
        {
          q: 'Can I check a private host?',
          a: 'Only hosts reachable from the public internet. For a server inside a VPC or behind a firewall, run openssl from a jump host or use a private monitoring agent.',
        },
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
        'A browsable, searchable reference of every HTTP status code your API is realistically going to emit, with a plain-English explanation and a class label (informational, success, redirect, client error, server error). Useful for settling team debates, documenting API contracts, and decoding the otherwise-cryptic numbers your monitoring sends you at 3 AM.',
      howItWorks: [
        'HTTP defines five status classes by the first digit: 1xx (informational, rare in practice), 2xx (success), 3xx (redirect), 4xx (client made a mistake), 5xx (server has a problem). The exact code within a class refines the meaning so the caller can react programmatically.',
        'The tool indexes every code by number, official IANA name, common alternate names, and a one-line meaning. Search matches against all of those, so typing "missing" or "auth" or "418" all find what you would expect.',
        'For status codes with subtle distinctions (401 vs 403, 502 vs 504), the entries include the discriminating question — "is this about identity (401) or permission (403)?" — so you can pick correctly when designing an API.',
      ],
      useCases: [
        'Settling a team debate on whether to return 401 or 403 for "this user does not own the resource".',
        'Documenting an API contract with the right code per failure mode.',
        'Looking up an unfamiliar code from a server log without leaving the terminal mentally.',
        'Picking the right redirect code when an endpoint moves (301 vs 308 vs 307).',
        'Deciding whether to return 409 or 422 for a validation failure on POST.',
        'Confirming whether a CDN-introduced 522 or 524 is your problem or theirs.',
      ],
      examples: [
        {
          title: '401 vs 403',
          input: '401, 403',
          output:
            '401 Unauthorized — caller did not prove who they are.\n403 Forbidden — caller proved who they are, but is not allowed.',
          note: 'Litmus test: would a valid token change the answer? Yes → 401. No → 403.',
        },
        {
          title: '301 vs 308',
          input: '301, 308',
          output:
            '301 Moved Permanently — historically allowed clients to switch POST to GET.\n308 Permanent Redirect — same semantics but POST must remain POST.',
          note: 'For permanent redirects of non-GET methods, prefer 308.',
        },
        {
          title: '502 vs 504',
          input: '502, 504',
          output:
            '502 Bad Gateway — your upstream returned an invalid response.\n504 Gateway Timeout — your upstream did not respond in time.',
          note: 'Same proxy layer, different upstream behavior. Logging both with the upstream name pins down which service is sick.',
        },
      ],
      gotchas: [
        'Not every status code in the spec is appropriate for production use. 418 I\'m a teapot is a real registered code, but emitting it tells the world you are joking. Stick to the dozen-or-so codes your API actually needs.',
        '204 No Content has a body of literally zero bytes. Returning 204 with a JSON body violates the spec — some clients (most browsers, fetch) will discard the body silently.',
        '429 Too Many Requests should include a Retry-After header. Without it, clients have no idea when to back off.',
        '500 Internal Server Error is a tempting catch-all but tells your client nothing. Aim for more specific codes (502, 503, 504) when you can.',
        'Browsers cache 301 and 308 aggressively. If you redirect by mistake and ship the fix five minutes later, users will still hit the old redirect for days. Test redirects with curl before deploying.',
      ],
      faq: [
        {
          q: 'What is the difference between 401 and 403?',
          a: '401 means the request had no credentials or invalid credentials. 403 means the request had valid credentials, but the authenticated identity is not allowed to do this thing. The browser will prompt for credentials on a 401 but not a 403.',
        },
        {
          q: 'When should I use 422 vs 400?',
          a: 'Use 400 when the request is malformed at the protocol level — missing required headers, invalid JSON, unparseable. Use 422 when the request parsed cleanly but failed business validation (email already in use, age below 18).',
        },
        {
          q: 'Is 201 always the right success code for POST?',
          a: 'Only when the POST created a new resource. If POST triggers an action with no created entity (sending an email, kicking off a job), 200 with a result body or 202 Accepted (for async) is more accurate.',
        },
        {
          q: 'When do I use 503 vs 500?',
          a: '503 Service Unavailable signals a transient problem — overloaded, in maintenance, dependency down — and clients should retry. 500 Internal Server Error signals an unexpected bug, and retries probably will not help. Pair 503 with a Retry-After header.',
        },
        {
          q: 'Are 3xx codes really redirects?',
          a: 'Most are. 304 Not Modified is the odd one out — it tells the client the cached version is still fresh. 300 Multiple Choices exists but is rarely used.',
        },
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
        'Generates cryptographically random passwords or readable passphrases entirely in your browser, backed by the same CSPRNG (crypto.getRandomValues) you would use in production code. Nothing is uploaded, logged, or remembered between sessions. The strength meter rates output by entropy — the actual measure of how hard the result is to guess — not by superficial rules like "must contain a digit".',
      howItWorks: [
        'crypto.getRandomValues fills a Uint8Array with bytes from the OS-level CSPRNG: getrandom on Linux, BCryptGenRandom on Windows, SecRandomCopyBytes on macOS. This is the same source TLS uses for session keys, so the randomness is good enough for any password.',
        'For character passwords, each random byte is mapped to a position in your chosen alphabet (letters + digits + symbols, with optional similar-character exclusion for I/l/1, O/0). Bytes that would bias the distribution are discarded and re-drawn, so every character in the output is uniformly random.',
        'For passphrases, the tool picks N words uniformly at random from a wordlist (typically the EFF large list of ~7,776 words). Each word adds about 12.9 bits of entropy, so a 5-word passphrase carries ~64 bits — equivalent to a 12-character random alphanumeric password but far easier to type and remember.',
      ],
      useCases: [
        'Spinning up a new admin account where you need a secret you will not reuse anywhere else.',
        'Generating a memorable passphrase for SSH key encryption, an age key, or a 1Password vault.',
        'Producing a non-rotatable secret for an internal service or a CI runner.',
        'Seeding test fixtures with realistic but disposable credentials.',
        'Replacing the default "admin/admin" on a freshly installed appliance with something that survives a Shodan scan.',
        'Generating a Wi-Fi password long enough that nobody bothers brute-forcing it.',
      ],
      examples: [
        {
          title: '20-character mixed password',
          input: 'Length: 20, letters + digits + symbols',
          output: 'qX7$wPmZ2tLh!9aR@nKv',
          note: 'About 131 bits of entropy. Computationally infeasible to brute-force at any scale that exists today.',
        },
        {
          title: '6-word EFF passphrase',
          input: 'Mode: passphrase, 6 words',
          output: 'crouton bandstand wreckage chaplain blaze prelaunch',
          note: 'About 77 bits of entropy. Easier to type than the random version above, and only marginally weaker.',
        },
      ],
      gotchas: [
        'Length matters more than complexity. A 20-character random string already exceeds the search budget of every attacker on Earth combined. Adding a sixth special character to a 10-character password barely moves the needle compared to adding two random letters.',
        'Do not reuse generated values across services — that defeats the entire point of generating them. Pair this tool with a password manager.',
        'Strength meters that count "uppercase, lowercase, digit, special" are not measuring real strength. Entropy is the right metric. Two zxcvbn-style libraries can disagree by several bits on the same input; treat ratings as guidance, not gospel.',
        'Passphrases survive shoulder-surfing better than random passwords because the words come from a public wordlist — knowing the list does not help an attacker guess your specific draw.',
        'Some services silently truncate passwords past 64 or 72 characters. If a generated value is long, do a round-trip login test before relying on it.',
        'Storing the output of this generator anywhere other than a real password manager (1Password, Bitwarden, KeePass) defeats the security benefit. A note in Slack is not safe.',
      ],
      faq: [
        {
          q: 'Is the generator really random?',
          a: 'Yes — it uses the same OS-level CSPRNG that TLS, ssh-keygen and openssl rand use. Math.random would not be safe; crypto.getRandomValues is.',
        },
        {
          q: 'How long should my password be?',
          a: 'At least 16 random characters or 5–6 EFF passphrase words for anything important. For email, banking, and anything that controls other accounts (password manager master, email-recovery account), prefer 20+ random or 7+ words.',
        },
        {
          q: 'Random characters or passphrase — which is stronger?',
          a: 'Per character of length, random wins. Per character of typing, passphrases win at the same security level. For interactive logins where you type the password regularly, passphrases are usually the better trade-off. For machine-only credentials, random is fine.',
        },
        {
          q: 'Should I include symbols?',
          a: 'Symbols add about 3 bits of entropy per character compared to alphanumeric. Useful when you are constrained to short lengths; not as important once your length is over 20. Some services still reject specific symbols, so check the policy before generating.',
        },
        {
          q: 'Does the tool remember my passwords?',
          a: 'No. Generated values live only in your tab and disappear when you navigate away. Copy what you need into a password manager immediately.',
        },
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
        'A pure-bitmath calculator for IPv4 CIDR blocks. Type a notation like 10.0.0.0/16 and get the network address, broadcast address, dotted-decimal netmask, inverse (wildcard) mask, first and last usable host addresses, and total host count. Useful when designing VPC layouts, splitting a subnet for a new environment, or sanity-checking that the /29 your network team handed you actually fits the six servers you needed.',
      howItWorks: [
        'A CIDR (Classless Inter-Domain Routing) notation 10.0.0.0/16 means "the network where the first 16 bits are fixed and the last 16 bits are the host part". The "/16" is the prefix length.',
        'The network address is the lowest IP in the block (all host bits zero). The broadcast is the highest (all host bits one). The number of host bits gives you the size: 2^host_bits total addresses, of which two (network + broadcast) are reserved for traditional IPv4 — usable hosts is total − 2.',
        'The netmask is the prefix length expressed as a dotted-decimal: /24 = 255.255.255.0, /16 = 255.255.0.0, /8 = 255.0.0.0. The wildcard mask is its bitwise inverse (0.0.0.255 for /24), used by Cisco ACLs and OSPF.',
      ],
      useCases: [
        'Picking a non-overlapping VPC CIDR before creating AWS or GCP subnets.',
        'Sanity-checking a /29 you are about to assign to a router or hardware appliance.',
        'Translating between dotted netmask (255.255.255.0) and slash form (/24) in either direction.',
        'Splitting a large /16 into multiple /24 subnets for staging environments.',
        'Confirming whether two CIDR blocks overlap before connecting two VPCs.',
        'Working out the broadcast address so you can configure a static route correctly.',
      ],
      examples: [
        {
          title: 'A standard /24 network',
          input: '192.168.1.0/24',
          output:
            'Network:    192.168.1.0\nBroadcast:  192.168.1.255\nNetmask:    255.255.255.0\nWildcard:   0.0.0.255\nFirst host: 192.168.1.1\nLast host:  192.168.1.254\nUsable hosts: 254',
          note: '254 usable hosts — total 256 addresses minus network and broadcast.',
        },
        {
          title: 'A point-to-point /30 link',
          input: '10.0.0.4/30',
          output:
            'Network:    10.0.0.4\nBroadcast:  10.0.0.7\nFirst host: 10.0.0.5\nLast host:  10.0.0.6\nUsable hosts: 2',
          note: 'Just two usable IPs — exactly what you need for a router-to-router serial link or VPN endpoint pair.',
        },
        {
          title: 'A large AWS VPC',
          input: '10.0.0.0/16',
          output:
            'Network: 10.0.0.0\nBroadcast: 10.0.255.255\nUsable hosts: 65,534\nRoom for: 256 × /24 subnets or 16 × /20 subnets',
          note: 'A /16 is the default AWS VPC size. Split it into /24 subnets per AZ for breathing room.',
        },
      ],
      gotchas: [
        '/31 and /32 are special. /32 is a single host address (no network or broadcast). /31 is a two-address point-to-point link (RFC 3021) where both addresses are usable. The calculator treats both correctly.',
        'AWS VPC subnets reserve the first FOUR usable addresses, not just network + broadcast. A /28 gives you 11 usable IPs in AWS, not 14. Other clouds have similar but not identical conventions — check the docs.',
        'IPv6 calculations need a different tool — this is IPv4 only. IPv6 prefix lengths go up to /128, and there are no broadcast addresses in IPv6.',
        'A /20 in AWS produces 4,094 usable IPs (4096 − 2 − AWS\'s extra 4 — but AWS only takes the 4 from the start of each subnet, not the parent VPC). Sizing is per-subnet, not per-VPC.',
        'Some firewall and OSPF configs use the wildcard mask (the inverse). For a /24, that is 0.0.0.255, not 255.255.255.0. Reading a Cisco config without remembering this is a common confusion.',
        'Public IP allocations are sparse — your ISP might give you a /29 (6 usable), not a contiguous block of "8 IPs". The unusable two are the network and broadcast of that block.',
      ],
      faq: [
        {
          q: 'How many IPs are in a /24?',
          a: '256 total, 254 usable (network + broadcast reserved). The convenient round number is why /24 is the most common subnet size for offices, home networks and small cloud subnets.',
        },
        {
          q: 'What is the difference between a CIDR and a subnet?',
          a: 'A CIDR is a way to write a subnet — a network address plus a prefix length. "Subnet" is the more general concept; CIDR is just the modern variable-length notation. /24 replaces the legacy "class C" — same size, different naming.',
        },
        {
          q: 'How do I check if two CIDRs overlap?',
          a: 'Compare their network addresses after masking with the shorter prefix. If 10.0.0.0/16 contains 10.0.1.0/24 — yes, masking 10.0.1.0 with /16 gives 10.0.0.0, so the /24 is inside the /16. The calculator can help by showing the boundaries.',
        },
        {
          q: 'Is 0.0.0.0/0 a valid CIDR?',
          a: 'Yes — it means "every IPv4 address". Used in routing tables as the default route, and in security group rules to mean "allow from anywhere". The mirror in IPv6 is ::/0.',
        },
        {
          q: 'Can I use a /23 to get more usable hosts than a /24?',
          a: 'Yes. A /23 covers 512 addresses (510 usable), twice as many as a /24. It also requires aligning on a multiple-of-512 boundary, so 10.0.0.0/23 is fine but 10.0.1.0/23 is invalid.',
        },
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
        'Computes the WCAG 2.1 contrast ratio between any two colors using the official relative-luminance formula, then tells you exactly which conformance levels the combination passes for. AA requires 4.5:1 for normal text and 3:1 for large text; AAA requires 7:1 and 4.5:1. A live preview shows your foreground on the chosen background so you can verify visually before shipping. Critical for any design that wants to be legally and ethically accessible.',
      howItWorks: [
        'WCAG 2.1 defines contrast ratio as (L1 + 0.05) / (L2 + 0.05), where L1 is the relative luminance of the lighter color and L2 the darker. Luminance itself is a weighted sum: L = 0.2126·R + 0.7152·G + 0.0722·B, with each channel first run through a sRGB-to-linear transformation.',
        'The ratio ranges from 1:1 (identical colors, invisible) to 21:1 (black on white). The pass/fail thresholds are: 3:1 (AA large / AAA large), 4.5:1 (AA normal / AAA large), 7:1 (AAA normal).',
        'On every input change, the tool parses both colors (hex, rgb, hsl all accepted), converts each to a linear-RGB luminance, computes the ratio, and renders the four pass/fail badges side by side along with a live text preview.',
      ],
      useCases: [
        'Verifying a brand color combination meets accessibility guidelines before shipping a redesign.',
        'Auditing a button\'s focus state contrast — focus indicators have their own 3:1 minimum.',
        'Picking which of several muted text colors meets AA against your chosen background.',
        'Comparing dark-mode and light-mode contrast for the same content.',
        'Documenting an accessibility audit with screenshots of the ratio for each color pair used.',
        'Confirming a legacy site\'s gray-on-gray text actually fails before lobbying to fix it.',
      ],
      examples: [
        {
          title: 'Black on white',
          input: 'Foreground: #000000\nBackground: #ffffff',
          output: 'Ratio: 21:1\nAA normal: ✓ AA large: ✓ AAA normal: ✓ AAA large: ✓',
          note: 'The maximum possible contrast. Useful as a sanity check that the tool is working.',
        },
        {
          title: 'A common "fail" — gray on white',
          input: 'Foreground: #999999\nBackground: #ffffff',
          output: 'Ratio: 2.85:1\nAA normal: ✗ AA large: ✗ AAA normal: ✗ AAA large: ✗',
          note: 'Body text in #999 on white fails every level. Designers reach for this color all the time; legal compliance and real users with low vision both push back.',
        },
        {
          title: 'A passing dark-mode pair',
          input: 'Foreground: #ededed\nBackground: #0a0a0f',
          output: 'Ratio: 17.34:1\nAA: ✓ AAA: ✓',
          note: 'The site\'s actual dark-mode body text. Comfortably above AAA.',
        },
      ],
      gotchas: [
        'WCAG 2.1 contrast does not account for font weight, anti-aliasing or the surrounding context. Designs that look low-contrast may technically pass; designs that look fine may technically fail. The new APCA algorithm (a draft for WCAG 3) addresses some of these gaps.',
        'For users with limited vision, AAA is the safer bar for body text. AA is the legal minimum; AAA is the design-for-everyone minimum.',
        '"Large text" in WCAG terms means 18pt regular or 14pt bold (about 24px / 18.66px on a typical 96-DPI screen). Below that, the stricter normal-text thresholds apply.',
        'Focus indicators, button borders and icon shapes have their own 3:1 minimum against adjacent colors. Pass body text and forget the focus ring is the most common contrast bug.',
        'Alpha (transparency) makes contrast undefined — the effective foreground depends on what is behind it. Convert semi-transparent colors to their solid equivalent against the actual background before measuring.',
        'WCAG ratios apply to the rendered pixel color, not the CSS value. CSS filters, opacity, blend modes all change what the user sees and what the contrast actually is.',
      ],
      faq: [
        {
          q: 'What is AA vs AAA?',
          a: 'WCAG defines three conformance levels: A (basic), AA (the legal minimum in most jurisdictions, the de facto industry baseline), and AAA (the strictest, often impractical for entire sites but useful for critical content). For contrast: AA wants 4.5:1 normal / 3:1 large; AAA wants 7:1 normal / 4.5:1 large.',
        },
        {
          q: 'My country requires accessibility — which standard applies?',
          a: 'Most jurisdictions (US ADA-related Section 508, EU EN 301 549, UK Equality Act) defer to WCAG 2.1 AA as the technical standard. AAA is rarely required by law but is the safer choice for products that aim for inclusive design.',
        },
        {
          q: 'What is APCA and should I use it instead?',
          a: 'APCA (Accessible Perceptual Contrast Algorithm) is a perception-based contrast metric proposed for WCAG 3. It accounts for font weight and size in ways WCAG 2 does not. It is not yet a normative standard, so most compliance audits still use WCAG 2.1.',
        },
        {
          q: 'Does this work for color combinations with transparency?',
          a: 'Not directly. Contrast requires a solid foreground and background. Pre-composite any alpha against the actual page background first, then measure the resulting color.',
        },
        {
          q: 'What is the contrast minimum for an icon?',
          a: 'For "non-text" content (icons, UI components, focus indicators, chart elements), WCAG 2.1 requires 3:1 against adjacent colors. Text inside the icon still needs 4.5:1.',
        },
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
        'Parses YAML in your browser using js-yaml — the same parser most Node-based tools use — and reports any errors with the exact line and column they occurred on. The result is shown as either re-formatted canonical YAML or pretty-printed JSON, so you can round-trip a Kubernetes manifest, a Docker Compose file, or a GitHub Actions workflow without leaving the page.',
      howItWorks: [
        'On every change, the YAML source is fed to js-yaml\'s load function with the FAILSAFE_SCHEMA, which means values are parsed strictly: no implicit type coercion (so "yes" stays a string, not a boolean), no custom tags, no anchors that resolve to surprises.',
        'If parsing succeeds, the resulting JavaScript object is re-serialized — either back to YAML with consistent indentation and no editor-specific cruft, or to JSON for tools that do not speak YAML natively.',
        'If parsing fails, the error object includes the offending line and column. The UI highlights the spot so you do not have to count indentation by eye.',
      ],
      useCases: [
        'Spotting why your Kubernetes manifest fails to apply because of a tab character that the editor silently inserted.',
        'Converting a YAML config to JSON for a script or service that does not parse YAML.',
        'Re-flowing hand-edited YAML to canonical form before committing — no mixed indentation, no inconsistent quoting.',
        'Validating a GitHub Actions or GitLab CI workflow before pushing it.',
        'Checking that an anchor and alias (& and *) are pointing at what you think they are.',
        'Confirming that a long string with embedded newlines uses the right block-scalar style (| vs >).',
      ],
      examples: [
        {
          title: 'YAML to JSON',
          input: 'name: deploy\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest',
          output:
            '{\n  "name": "deploy",\n  "on": { "push": { "branches": ["main"] } },\n  "jobs": { "build": { "runs-on": "ubuntu-latest" } }\n}',
          note: 'Note that "on" stays a string key (not coerced to a boolean) because we use the strict YAML 1.2 rules.',
        },
        {
          title: 'A common indentation error',
          input: 'foo:\n  bar: 1\n   baz: 2',
          output: 'Error: bad indentation of a mapping entry (line 3, column 4)',
          note: 'The "baz" line has three spaces instead of two, so YAML cannot decide which level it belongs to.',
        },
      ],
      gotchas: [
        'Tabs are not valid YAML indentation. An editor that auto-converted spaces to tabs (or pasted-in copy from a terminal) is the most common cause of "this looks fine but does not parse".',
        'YAML 1.2 fixed the "Norway problem" — "no" is no longer auto-coerced to false. But many tools still ship YAML 1.1 parsers (Ansible historically, some Java libraries), so the same file can behave differently depending on who consumes it.',
        'Anchors (&name) and aliases (*name) are part of the spec, but Kubernetes, GitHub Actions, and several other consumers reject them or expand them inconsistently. Stick to plain YAML when targeting those systems.',
        'Long lines wrapped with > or | look similar but behave differently — | preserves newlines, > folds them into spaces. A Dockerfile RUN script under a > would lose every line break.',
        'Document separators (---) split a single file into multiple YAML documents. Tools that read only the first document will silently ignore later ones.',
        'JSON is technically valid YAML, so a JSON blob pasted here will parse — useful, but occasionally confusing when the YAML reformatter adds quotes back where you removed them.',
      ],
      faq: [
        {
          q: 'Is YAML strictly a superset of JSON?',
          a: 'YAML 1.2 is, intentionally. Any valid JSON document is also valid YAML. This is the technical justification for tools that accept "YAML" actually accepting both.',
        },
        {
          q: 'Why does "no" sometimes become false?',
          a: 'YAML 1.1 included an implicit boolean alias list that maps yes/no/on/off/true/false to true/false. YAML 1.2 dropped that to fix the Norway country-code disaster. If your parser is 1.1, quote the literal string ("no") to keep it a string.',
        },
        {
          q: 'What is the difference between |, >, |-, and >-?',
          a: 'Block scalars. | keeps newlines, > folds them into spaces. A trailing - strips the final newline. So | is literal multi-line, > is paragraph-style, and the dash version trims trailing whitespace.',
        },
        {
          q: 'My YAML is valid here but Kubernetes rejects it. Why?',
          a: 'Kubernetes does its own validation against the resource schema after parsing. Common causes: wrong apiVersion, missing required field, or an indented value that parsed as the wrong type (a string where an int was expected).',
        },
        {
          q: 'Does this tool support YAML directives or custom tags?',
          a: 'It supports the standard %YAML directive and the core schema. Custom tags (!Ref in CloudFormation, !Vault in Ansible) are tool-specific and not part of pure YAML; this validator will reject them. Strip or convert them first.',
        },
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
        'Pretty-prints SQL across the dialects you actually use — MySQL, PostgreSQL, T-SQL (MSSQL), Snowflake, BigQuery, Redshift, SQLite, Oracle and plain SQL — by routing your query through the open-source sql-formatter library. The dialect you pick matters: each one has its own reserved words and quoting conventions, and choosing wrong can mis-tokenize a legal keyword like BigQuery\'s STRUCT into a column name. Output preserves your comments in place so the formatted version is safe to paste straight into a PR.',
      howItWorks: [
        'sql-formatter tokenizes the input using a dialect-specific lexer that knows which strings are keywords (SELECT, WITH), which are functions (COUNT, COALESCE), and which are operators or literals. Tokens are then placed onto new lines according to the formatter\'s rules: one clause per line, joined arguments lined up, parentheses expanded for readability.',
        'Indentation and casing are configurable. Most teams pick 2-space indent with uppercase keywords because that is what historic style guides (Mozilla, Joe Celko\'s) used; some modern style guides prefer lowercase. The formatter never changes the meaning of your SQL — only the layout and the visible case of keywords.',
        'Because the lexer is dialect-aware, a query that uses PostgreSQL-only features like WINDOW … AS … or JSON_BUILD_OBJECT keeps those tokens intact when you format under the PostgreSQL dialect, but might be reformatted weirdly under "standard SQL". When in doubt, match the warehouse.',
      ],
      useCases: [
        'Reading a one-line query pulled from a log or APM trace into something a human can review.',
        'Cleaning up a copied-from-an-ORM query that has zero whitespace before pasting into a PR.',
        'Normalizing case in legacy SQL where someone wrote `SELECT` on one line and `select` on the next.',
        'Producing a clean canonical form so a diff between two query versions actually shows the logical change, not whitespace noise.',
        'Re-formatting a query before pasting into documentation so it does not span 400 columns.',
        'Spotting an unmatched parenthesis or comma by letting the formatter re-indent the structure.',
      ],
      examples: [
        {
          title: 'Minified query to clean form',
          input:
            "SELECT u.id,u.email,count(o.id) FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE u.created_at>'2026-01-01' GROUP BY u.id,u.email ORDER BY count(o.id) DESC LIMIT 10",
          output:
            "SELECT\n  u.id,\n  u.email,\n  COUNT(o.id)\nFROM\n  users u\n  LEFT JOIN orders o ON o.user_id = u.id\nWHERE\n  u.created_at > '2026-01-01'\nGROUP BY\n  u.id,\n  u.email\nORDER BY\n  COUNT(o.id) DESC\nLIMIT\n  10",
          note: 'Same query, readable. The JOIN and its ON clause are kept on the same row because the formatter treats them as a compound.',
        },
      ],
      gotchas: [
        'Dialect choice matters. T-SQL (MSSQL) treats square brackets [col] as identifier delimiters; PostgreSQL treats them as part of an array literal. Picking the wrong dialect can mis-tokenize a column name.',
        'Comments are preserved verbatim, including their exact position relative to surrounding tokens. A trailing `-- comment` on the same line as a token stays attached to that token after formatting.',
        'The formatter does not validate SQL semantics. A syntactically invalid query (missing FROM, mismatched parens) often still formats — only execution will catch the error.',
        'Some dialects have multiple reserved-word lists across versions. A query using newer keywords (PostgreSQL 16\'s GROUPS frame, BigQuery\'s WINDOW INHERIT) may not be recognized if the bundled library version is older.',
        'For very large queries (thousands of lines), formatting can take a noticeable fraction of a second. The library is fast but not infinitely so. Split the query if it becomes painful.',
        'Stored procedures, T-SQL control flow (IF/WHILE/BEGIN..END) and PL/pgSQL bodies format unevenly — the library is designed for SELECT/INSERT/UPDATE/DELETE first.',
      ],
      faq: [
        {
          q: 'Which dialect should I pick?',
          a: 'The one that matches your warehouse. PostgreSQL for Postgres/Citus/CockroachDB, MySQL for MySQL/MariaDB, T-SQL for SQL Server/Azure SQL, BigQuery for BigQuery, Snowflake for Snowflake. If you are not sure, "Standard SQL" is a safe-ish default but loses dialect-specific keyword recognition.',
        },
        {
          q: 'Will the formatter change my query semantics?',
          a: 'No. Formatting only affects whitespace, line breaks, indentation and the displayed case of keywords. The tokens themselves are unchanged. Run before and after through your test suite if you want belt-and-braces certainty.',
        },
        {
          q: 'Why are my UPPERCASE table names becoming lowercase (or vice versa)?',
          a: 'They are not — the formatter only changes the case of reserved keywords (SELECT, FROM) by default. Identifier case is whatever you typed. If the case looks different, you are probably looking at the keyword-case change, not an identifier change.',
        },
        {
          q: 'Does this run in the browser or on a server?',
          a: 'Entirely in your browser. sql-formatter is a JavaScript library; your query is never uploaded. Good for production queries you do not want to paste into a third-party site.',
        },
        {
          q: 'Can I format a stored procedure or trigger?',
          a: 'It will run, but the output may be uneven. The library is tuned for SELECT/DML; control-flow bodies (T-SQL BEGIN..END, PL/pgSQL DECLARE..BEGIN..END) format on a best-effort basis.',
        },
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
        'Scans a pasted Dockerfile against a curated set of common anti-patterns drawn from the Hadolint catalog, plus a handful of Docker community best practices. Each issue surfaces a line number, severity (error, warning, info, style) and a stable rule ID so you can look up the rationale. Useful as a fast pre-PR check, a teaching tool, or a sanity pass on a Dockerfile copied from a tutorial of unknown vintage.',
      howItWorks: [
        'The linter tokenizes each line into an instruction (FROM, RUN, COPY, etc.) and its arguments. Multi-line RUN commands joined with `\\` are reassembled before analysis.',
        'A set of rule functions inspects the parsed instructions. Some rules check single instructions (FROM with `:latest`, USER missing, COPY without ownership). Others check ordering or interactions (apt-get install without --no-install-recommends, multiple RUNs that should be chained).',
        'Each finding is annotated with a stable rule ID like DL3007 (use specific tag, not `latest`) or DL3009 (delete apt cache after install). The IDs map to Hadolint\'s catalog, so you can search "DL3009" anywhere for the full rationale.',
      ],
      useCases: [
        'Pre-checking a Dockerfile before opening a PR.',
        'Teaching a teammate why `RUN apt-get install -y curl` without a follow-up `rm -rf /var/lib/apt/lists/*` bloats the image.',
        'Quick audit of a Dockerfile pulled from a tutorial that may be from 2018.',
        'Confirming a base image upgrade did not silently introduce a regression.',
        'Highlighting layers that would benefit from being combined or split.',
        'Catching root-user issues before they get into production.',
      ],
      examples: [
        {
          title: 'A Dockerfile with several common issues',
          input:
            'FROM node:latest\nRUN apt-get update && apt-get install -y curl\nCOPY . /app\nWORKDIR /app\nRUN npm install\nCMD ["node", "server.js"]',
          output:
            'Line 1: DL3007 — Avoid using `latest` tag; pin to a specific version.\nLine 2: DL3008 — Pin apt package versions: `curl=...`.\nLine 2: DL3009 — Delete the apt cache after install (rm -rf /var/lib/apt/lists/*).\nLine 3: DL3000 — COPY/ADD should specify a USER before, or run as a non-root user.\nLine 5: DL3016 — Pin npm package versions in package.json instead of relying on default install.',
          note: 'Five issues across five lines. Fixing them keeps the image smaller, more reproducible and safer.',
        },
      ],
      gotchas: [
        'This is a fast in-browser subset of Hadolint. For full coverage, CI gating and the latest rules, run Hadolint properly (it has 50+ rules, this tool covers the most impactful ones).',
        'Some "issues" are style-level — not bugs, but team-defined conventions. Suppress with care; the rule IDs make it easy to ignore in a config file.',
        'Multi-stage Dockerfiles are analyzed per stage. Issues in an early stage that get discarded in the final image are still flagged because they affect build time and layer cache.',
        'The linter cannot evaluate runtime behavior. A RUN that downloads from an unpinned URL will not trigger a warning even though the build is non-reproducible.',
        'BuildKit-specific syntax (RUN --mount=...) is supported by the parser but not analyzed for BuildKit-specific patterns.',
        'A passing lint is not a guarantee the image is secure or efficient. Scanning the built image with trivy or syft catches issues lint cannot see.',
      ],
      faq: [
        {
          q: 'What is Hadolint?',
          a: 'The de facto Dockerfile linter — an open-source CLI written in Haskell that ships with ~70 rules. The catalog of rule IDs (DL3000–DL4000) is well-documented and stable. This tool implements a subset that fits in a browser.',
        },
        {
          q: 'Why is using `latest` bad?',
          a: 'Because `:latest` floats — what `latest` resolves to today is not what it will resolve to tomorrow. Builds become non-reproducible, and you can wake up to a broken image because the base bumped a major version. Always pin: `node:20.11.1-alpine`.',
        },
        {
          q: 'Why combine RUN commands?',
          a: 'Each RUN creates a layer. `RUN apt-get update` followed by `RUN apt-get install` produces a layer with stale apt cache and one with packages — the cache layer is permanently shipped. Combining with `&&` keeps the install layer self-contained.',
        },
        {
          q: 'Should I always run as a non-root USER?',
          a: 'Yes, in production. A container running as root inside the container can still escape to root on the host through certain misconfigurations. The container runtime makes it cheap to switch users — there is almost no reason not to.',
        },
        {
          q: 'How is this different from `docker scan` or trivy?',
          a: 'docker scan and trivy analyze the built image for known CVEs in installed packages. The linter analyzes the Dockerfile itself for structural and stylistic issues. Both are worth running; they catch different problems.',
        },
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
        'Generates a real RSA SSH key pair entirely in your browser using WebCrypto\'s crypto.subtle.generateKey. The private key is exported as PKCS#8 PEM (the format `ssh -i` accepts directly), and the public key in the standard OpenSSH single-line `ssh-rsa <base64> <comment>` form ready to paste into authorized_keys, GitHub deploy keys, or a cloud console. Both are downloadable. Crucially, the private key never crosses the network — it is generated in the OS\'s cryptographic random generator and stays in your tab.',
      howItWorks: [
        'crypto.subtle.generateKey produces an RSA key pair of the chosen size (2048, 3072 or 4096 bits) using the OS-level CSPRNG. The same source ssh-keygen on your machine would use.',
        'The private key is exported in PKCS#8 (Public-Key Cryptography Standards #8) format — an ASN.1 binary structure base64-encoded between -----BEGIN PRIVATE KEY----- markers. OpenSSH accepts this format natively.',
        'The public key is derived from the private key, converted to the OpenSSH wire format (a length-prefixed sequence of algorithm + exponent + modulus), and base64-encoded into the recognizable "ssh-rsa AAAAB3NzaC1yc2E…" line.',
      ],
      useCases: [
        'Bootstrapping a deploy key for a CI runner where you do not want to expose your personal SSH key.',
        'Generating a one-off key for a short-lived test environment.',
        'Replacing a compromised key fast, from any browser, without ssh-keygen installed.',
        'Creating a key inside a kiosk or restricted environment where the terminal is unavailable.',
        'Producing a fresh keypair for a customer integration where you need to send them a public key and keep the private side.',
        'Teaching what an SSH key actually looks like — both halves visible side by side.',
      ],
      examples: [
        {
          title: 'A 4096-bit RSA pair',
          input: 'Size: 4096, Comment: ci@deploy',
          output:
            '-----BEGIN PRIVATE KEY-----\nMIIJQgIBADANBgkqhkiG9w0BAQEF…\n-----END PRIVATE KEY-----\n\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB…  ci@deploy',
          note: 'The private key goes in ~/.ssh/id_rsa (mode 600). The public line goes in the remote authorized_keys or a deploy-key field.',
        },
      ],
      gotchas: [
        'Modern setups should prefer Ed25519 — smaller, faster, easier-to-audit keys. Most browsers do not yet expose Ed25519 export via WebCrypto, so this tool offers RSA only. RSA-3072 or RSA-4096 remains universally accepted.',
        'PKCS#8 PEM is what `ssh -i` accepts. If a tool specifically requires the legacy OpenSSH format (starts with -----BEGIN OPENSSH PRIVATE KEY-----), run `ssh-keygen -p -m OpenSSH -f keyfile` to convert.',
        'After saving the private key, set the permissions to 600 (rw-------) or OpenSSH will refuse to load it with "Permissions are too open". The chmod calculator on this site shows the exact command.',
        'A private key with no passphrase is sensitive — treat it like a password. If you generate one here and download it, store it in a password manager, an encrypted vault, or your SSH agent immediately.',
        'GitHub, GitLab, Bitbucket and most cloud consoles paste the public-key line verbatim. Watch for accidental trailing whitespace or line breaks — they will silently break the install.',
        'For machine-to-machine SSH (CI runners), prefer keys with no passphrase and tight permissions over passphrase-protected keys that need user interaction.',
      ],
      faq: [
        {
          q: 'Is the private key really only in my browser?',
          a: 'Yes. WebCrypto generates the key in the browser process and only the JavaScript in this tab can access it. No network call is made, no localStorage save, no telemetry. Closing the tab loses the key.',
        },
        {
          q: 'What size should I use?',
          a: 'RSA-3072 or RSA-4096 for any new key in 2026. RSA-2048 is still widely accepted but feels small. If your stack supports it, prefer ed25519 — but that requires using ssh-keygen or another tool because WebCrypto does not expose ed25519 export yet.',
        },
        {
          q: 'How do I use the key after downloading it?',
          a: 'Save the private key as ~/.ssh/id_rsa (or any name you prefer), chmod 600, then either add it to ssh-agent (ssh-add path/to/key) or pass it with -i. Paste the public-key line into the remote authorized_keys.',
        },
        {
          q: 'Should I add a passphrase?',
          a: 'For human-used keys, yes — it protects the key if your laptop is lost. For machine keys (CI runners), no — they cannot type a passphrase. Use proper filesystem permissions and a dedicated key per machine instead.',
        },
        {
          q: 'How is this different from ssh-keygen?',
          a: 'ssh-keygen is the official OpenSSH tool with more features (key comments, format conversion, passphrase prompts). This tool produces equivalent RSA keys when you just need a clean pair without opening a terminal.',
        },
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
        'A lightweight in-browser REST client. Pick a method (GET, POST, PUT, PATCH, DELETE), add headers, optionally send a JSON or text body, and inspect the response with timing, status, parsed body and the full set of returned headers. The same kind of thing you would use Postman or Insomnia for, in a webpage, with no install. Subject to browser CORS rules — see gotchas.',
      howItWorks: [
        'The tool uses the browser-native `fetch` API to make the request. The request method, URL, headers and body come from the form; the response comes back with status code, response headers, and body bytes that are parsed as JSON (or text) for display.',
        'Timing is measured with `performance.now()` around the fetch call — close to wall-clock latency, including DNS, TCP, TLS, request, server work and response.',
        'The pretty-printed response uses the same JSON formatter on this site, so deeply nested payloads are readable. Non-JSON responses are shown verbatim.',
      ],
      useCases: [
        'Smoke-testing an internal API without spinning up Postman or Insomnia.',
        'Sharing a request URL plus headers with a teammate by sending them the share URL.',
        'Quickly checking what your API returns for a given Authorization header.',
        'Verifying a webhook receiver responds correctly to a POST with a sample payload.',
        'Confirming an endpoint applies the right rate-limit headers (X-RateLimit-*).',
        'Building up a request by trial and error before translating it into a curl command or code.',
      ],
      examples: [
        {
          title: 'A basic authenticated GET',
          input:
            'Method: GET\nURL: https://api.example.com/users/me\nHeaders:\n  Authorization: Bearer eyJ...',
          output: 'Status: 200\nLatency: 142ms\nBody: { "id": 42, "email": "jane@example.com" }',
          note: 'The response body is pretty-printed JSON. Status code and timing appear above.',
        },
      ],
      gotchas: [
        'Browser CORS will block requests to APIs that do not return permissive `Access-Control-Allow-Origin` headers. There is no way around this from a webpage. The Linux desktop build of debugdaily (Tauri) bypasses CORS because it talks to APIs from a native process.',
        'Sensitive bearer tokens are visible to any extension installed in your browser, and visible in the page DOM. For high-stakes secrets, use the desktop app or curl.',
        'A "200 OK" with an empty or non-JSON body is normal for some APIs. The tool reports the actual response — it does not assume.',
        'Cookies are not sent by default (no `credentials: include`). If your API requires session cookies, you may see 401s here even though the same request would work from your app.',
        'Some APIs require specific Content-Type values (`application/x-www-form-urlencoded` instead of JSON). The tool defaults to JSON for bodies but lets you override the header.',
        'Streaming responses (SSE, chunked) are read fully before display. For long-running endpoints, this will appear to hang.',
      ],
      faq: [
        {
          q: 'Why does my request fail with "CORS error"?',
          a: 'The target API did not return an `Access-Control-Allow-Origin` header that includes our origin, so the browser blocked the response from JavaScript. This is a browser security feature, not a tool bug. Test the same request from curl or the desktop app to confirm it works server-side.',
        },
        {
          q: 'Can I send cookies?',
          a: 'Not currently — the tool uses default fetch credentials. If you need cookie-based auth, log into the target API in a separate tab and try the request from there (some APIs allow that), or use curl with --cookie.',
        },
        {
          q: 'Is my request body uploaded to debugdaily?',
          a: 'No. The fetch call goes from your browser directly to the target API. Our servers are not in the path.',
        },
        {
          q: 'How do I send a file?',
          a: 'File uploads are not currently supported in the body. For multipart uploads, use the curl builder to generate the command, or run the request from a real tool like Postman.',
        },
        {
          q: 'Can I save requests like in Postman?',
          a: 'You can share the current request as a URL via the Share button — open the link to recreate the state. Saved collections are not implemented yet.',
        },
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
        'Looks up any public IPv4 or IPv6 address and returns its approximate geolocation, ISP/organization, autonomous system number (ASN), reverse DNS, and a set of usage flags — whether the address belongs to a residential ISP, a hosting provider, a known VPN, or a Tor exit. Submit no input and it returns the lookup for your own client IP, which is how you check what an outbound service sees when your traffic arrives.',
      howItWorks: [
        'A server-side function takes the requested IP, queries a geolocation database (ip-api.com on the free tier), and forwards the structured answer back to your browser. The answer includes coordinates accurate to roughly the city level, the ASN as both number and human-readable org name, and several boolean flags.',
        'For "look up my own IP", the function reads the request\'s source address (taking X-Forwarded-For chains into account) and uses that as the input. This is the IP a website actually sees you with — useful when you want to confirm a VPN is doing its job or that your egress NAT is pointed at the right pool.',
        'Geolocation is database-driven, not protocol-driven. The accuracy depends on how recently the database has been updated for that allocation. ASN data, which comes from BGP, is more reliable.',
      ],
      useCases: [
        'Confirming where a suspicious connection in your access logs is actually coming from.',
        'Verifying that your VPN is masking your real ISP and not silently dropping back to your local connection.',
        'Checking the ASN of a target IP before allow-listing or block-listing it in a firewall.',
        'Identifying whether traffic claiming to be from "Iowa" is actually from a Hetzner data center.',
        'Distinguishing residential users from datacenter scrapers for fraud-detection rules.',
        'Tracing the route a customer\'s request takes when they report different behavior than expected.',
      ],
      examples: [
        {
          title: 'A Cloudflare IP',
          input: '1.1.1.1',
          output:
            'Country: AU\nOrg: Cloudflare, Inc.\nASN: 13335\nReverse DNS: one.one.one.one\nFlags: hosting',
          note: 'Cloudflare\'s public DNS resolver. The hosting flag and the AS number both signal "this is a cloud provider", not a home user.',
        },
        {
          title: 'Your own IP',
          input: '(empty input)',
          output: 'Returns the IP your request arrived from, plus its geolocation.',
          note: 'Same trick as ipchicken or "what is my IP". Handy when behind multiple proxies.',
        },
      ],
      gotchas: [
        'Free-tier geolocation is approximate — city accuracy is rarely better than ±50 km, and for ranges with no recent traffic it can be wildly wrong. Treat city as a hint, not an authoritative answer.',
        'VPN/proxy detection lags reality. A newly-rotated VPN exit may not be flagged yet; a residential IP that briefly hosted a Tor exit may stay flagged for months after.',
        'IPv6 lookups depend on the database having coverage for the /48 or /64 prefix. Coverage is patchier than IPv4 because allocations are more recent.',
        'CG-NAT (carrier-grade NAT) and mobile networks share a single egress IP among many users. The location returned is the egress, not the user — accurate for the ISP but not for the person.',
        'A private IP (10.x, 172.16–31.x, 192.168.x, 169.254.x) cannot be geolocated because the database has nothing to look up. The tool will say "private" and stop there.',
        'IPs migrate between regions when allocations change hands. A lookup result from a year ago can be outdated even for a static IP.',
      ],
      faq: [
        {
          q: 'How accurate is the geolocation?',
          a: 'Country-level: usually correct. City-level: roughly correct within tens of kilometers for residential ISPs in well-mapped countries, much less accurate for mobile and CG-NAT IPs. Coordinates should be treated as the centroid of a probable region, not a real address.',
        },
        {
          q: 'What is an ASN?',
          a: 'An Autonomous System Number is the identifier for a network operator at the BGP level. AS13335 is Cloudflare, AS32934 is Facebook, AS15169 is Google. Two IPs in the same ASN are operated by the same organization.',
        },
        {
          q: 'Why does the tool say "hosting" for my home IP?',
          a: 'Either you are behind a VPN that resolves to a datacenter, or your ISP\'s allocation got reclassified. If the ASN says "Comcast" or "BT" and the flag says "hosting", that is a database error — file feedback.',
        },
        {
          q: 'Can I look up someone\'s IP if I have only a username?',
          a: 'No. This tool resolves IPs you already have. It does not de-anonymize accounts or perform OSINT on usernames.',
        },
        {
          q: 'Is my own IP recorded?',
          a: 'The serverless function logs the queried IP for rate limiting and abuse prevention, with a short retention window. No personal data is collected beyond what the request itself carries.',
        },
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
        'Queries the modern RDAP system (rdap.org) for any registered domain and surfaces the fields you actually care about: registrar, registration date, last updated, expiry, EPP status flags and nameservers. RDAP is the structured JSON replacement for legacy WHOIS — same registry data, but parseable rather than hand-formatted text. The expiry date is color-coded so a soon-to-expire domain is immediately obvious.',
      howItWorks: [
        'RDAP (Registration Data Access Protocol, RFC 7480–7484) is the IETF-blessed successor to WHOIS. Where WHOIS spoke over port 43 and returned freeform text that varied wildly between registries, RDAP speaks HTTPS and returns standardized JSON.',
        'When you submit a domain, the tool forwards the lookup through rdap.org, which routes to the correct registry RDAP server based on the TLD. The response is normalized into the registration metadata, status flags and nameservers.',
        'The "expires in" badge compares the registry expiration date to the current server time. Renewing a domain only updates the registry record after the registrar pushes the renewal upstream, which can take a day — so the badge can lag your actual renewal by 24 hours.',
      ],
      useCases: [
        'Catching a domain that is about to expire so you can renew before it drops.',
        'Confirming who registered a suspicious lookalike domain during a phishing investigation.',
        'Auditing the nameservers a domain currently points at — useful when a DNS change is mysteriously not working.',
        'Verifying that a domain transfer completed and the new registrar is in place.',
        'Checking EPP status flags (clientTransferProhibited, serverHold) before initiating a transfer.',
        'Spotting recently registered domains with privacy-redacted contacts (a common bot-traffic signal).',
      ],
      examples: [
        {
          title: 'A standard gTLD lookup',
          input: 'example.com',
          output:
            'Registrar: ICANN\nRegistered: 1995-08-14\nExpires: 2026-08-13 (218 days)\nNameservers: a.iana-servers.net, b.iana-servers.net\nStatus: clientTransferProhibited, serverDeleteProhibited',
          note: 'A long-lived domain. The clientTransferProhibited flag prevents a rogue transfer; serverDeleteProhibited is a registry-level lock.',
        },
        {
          title: 'Days-from-expiry badge',
          input: 'expiring-soon.example',
          output: '23 days remaining (amber)',
          note: 'Color thresholds: green >30 days, amber 8–30, red ≤7 or expired.',
        },
      ],
      gotchas: [
        'ccTLDs (e.g., .uk, .br, .jp, .de) often return less data than gTLDs by design — local privacy regulations vary, and many ccTLD registries return only a registrar and expiry.',
        'Recently-transferred domains may show stale registrar info for up to 24 hours while the registry catches up.',
        'Privacy services (WhoisGuard, Domains By Proxy) replace the registrant contact with a forwarder, so "registrant" looking like a privacy service tells you nothing about who actually owns the domain.',
        'A domain that does not exist will return 404, not "available" — registries do not expose availability through RDAP. Use a registrar\'s availability API or a whois client for that.',
        'GDPR has redacted most registrant personal data from gTLD responses since 2018. The registrar field is still there, but the contact email and name fields are usually masked.',
        'Some new gTLDs (.app, .dev, .page) are operated by Google and return slightly different field names. The tool normalizes the common ones.',
      ],
      faq: [
        {
          q: 'What is the difference between WHOIS and RDAP?',
          a: 'WHOIS is the original protocol — port 43, freeform text, registry-specific format. RDAP is the modern replacement — HTTPS, structured JSON, consistent fields. ICANN has been migrating gTLDs from WHOIS to RDAP since 2018.',
        },
        {
          q: 'Why is the registrant field redacted?',
          a: 'GDPR. Since 2018, ICANN has required gTLD registries to mask personal information in public WHOIS/RDAP responses. Some registrars allow domain owners to opt in to publishing their information.',
        },
        {
          q: 'How do I find out if a domain is available to register?',
          a: 'Not through this tool. RDAP returns "not found" for any domain not in the registry, but registrars are the only authoritative source for availability because some domains are reserved or premium-priced.',
        },
        {
          q: 'What does serverHold mean?',
          a: 'A registry-level status that suspends the domain from the DNS. Usually applied for legal disputes, abuse, or non-payment. A domain with serverHold will not resolve even if the nameservers look correct.',
        },
        {
          q: 'How current is the data?',
          a: 'RDAP queries hit the live registry, so the data is as current as the registry has — typically within minutes of any registrar update. The exception is transfer events, which propagate over hours.',
        },
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
        'Does a server-side HTTP request to any public URL and reports the result: status code, the full redirect chain (each hop with its own status), total response time end-to-end, and whether the page loaded successfully. Useful for confirming a site is actually up from outside your network ("is it down for me, or down for everyone?"), spot-checking deploys, and auditing redirect chains that hurt SEO.',
      howItWorks: [
        'A serverless function does a GET against the target URL with manual redirect handling. Each response with a 3xx status is followed up to 5 hops total; each hop is recorded with its status and Location header.',
        'Total time is measured from the start of the first connection to the end of the final response body. Per-hop time is not separately measured (most of the latency is in the final hop anyway).',
        'The check uses a generic User-Agent string and no authentication. Sites that gate content behind login, cookies, or CAPTCHAs will return whatever they show anonymous visitors — usually a 200 with a login page, or a 401.',
      ],
      useCases: [
        'Confirming a CDN or DNS issue is not local before paging on-call.',
        'Auditing a redirect chain for unnecessary hops that hurt SEO (each 301 adds ~50–100ms of latency).',
        'Spot-checking a deploy after pushing — does the URL still respond, what does it respond with.',
        'Verifying a marketing redirect goes to the right destination across all the alias domains.',
        'Catching an accidental 302 where you meant 301, or vice versa.',
        'Quick sanity check after a TLS certificate rotation — the cert should still validate end-to-end.',
      ],
      examples: [
        {
          title: 'A site with a single redirect',
          input: 'http://example.com',
          output:
            'Hop 1: 301 Moved Permanently → https://example.com\nHop 2: 200 OK\nTotal time: 234ms',
          note: 'The http → https redirect is the most common single-hop chain on the modern web.',
        },
        {
          title: 'A chain that is too long',
          input: 'http://a.example/r',
          output:
            'Hop 1: 302 → http://b.example/r\nHop 2: 302 → http://c.example/r\nHop 3: 302 → http://d.example/r\nHop 4: 302 → http://e.example/r\nHop 5: 302 → http://f.example/r\nGave up at 5 hops — final destination not reached',
          note: 'Browsers stop following at ~20 redirects. We stop at 5 because a chain longer than that is almost always a bug.',
        },
      ],
      gotchas: [
        'Single-region check — for true "down for everyone" answers use a multi-region monitor (Pingdom, UptimeRobot, Better Uptime, Statuscake).',
        'Some sites return 200 to bots but block real browsers, or vice versa. This tool sends a generic User-Agent; the result may differ from what a real browser sees.',
        'The check is one-shot. For continuous monitoring you want a service that runs every minute and alerts on failure.',
        'Geographic routing (CloudFlare, Akamai, Fastly) means the result here may differ from a check from another region. The tool runs from a single Vercel region.',
        'IPv6-only hosts may fail because the check runs over the resolver\'s preferred address family — if there is no IPv4 record, dial timeouts are possible.',
        'A 200 result does not mean the page is functional. The page can return 200 with an error message in the body. Use a real synthetic-monitoring tool for content checks.',
      ],
      faq: [
        {
          q: 'Why does my site say "up" here but my users report it is down?',
          a: 'Most likely a region or ISP-specific routing problem. The check ran from a different network than your users. Use a multi-region monitor to see whether problems are localized.',
        },
        {
          q: 'How many redirects do you follow?',
          a: 'Up to 5. Most legitimate redirects are 1 or 2 hops; chains longer than that almost always indicate a misconfiguration or a redirect loop.',
        },
        {
          q: 'Does this check HTTPS certificates?',
          a: 'It connects over HTTPS but does not report cert details. For TLS-specific checks (expiry, chain, SAN) use the SSL Check tool.',
        },
        {
          q: 'What does "Status: -1" or "Error" mean?',
          a: 'The connection failed before getting a status code. Common causes: DNS resolution failed, the host refused the connection, the TLS handshake failed, or the request timed out.',
        },
        {
          q: 'Is the URL recorded anywhere?',
          a: 'The serverless function logs the URL and result for rate limiting. We do not store or share check history.',
        },
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
        'Generates real, scannable QR codes for any URL or text directly in your browser via the open-source qrcode library. You pick the error correction level, the pixel size and the foreground/background colors, then export as a true PNG bitmap or an SVG vector — no upload, no watermark, no per-day limit.',
      howItWorks: [
        'A QR code encodes data as a 2D grid of black and white modules. The encoder picks the smallest grid size (version 1–40) that fits your input plus the chosen error-correction overhead, lays out the data with Reed-Solomon error-correction bytes interleaved, and applies a mask pattern that minimizes scanner-confusing artifacts.',
        'Error correction (L 7%, M 15%, Q 25%, H 30%) means the scanner can recover the original data even when up to that fraction of the code is obscured or damaged. Higher correction lets you put a logo in the center; it also makes the code denser, so the printable size grows.',
        'PNG export rasterizes the matrix at the requested pixel size. SVG export emits one rect per module — small file, infinite zoom — which is what you want for print.',
      ],
      useCases: [
        'Putting a sign-up URL on a printed flyer or conference badge where a long URL would be impractical to type.',
        'Generating a Wi-Fi join QR for guests using the WIFI: format so scanning connects them directly.',
        'Embedding a deeplink in an email signature, video overlay, or sticker.',
        'Bridging a desktop session to a mobile device (open this URL on your phone).',
        'Putting menu URLs on table tents in restaurants and pop-ups.',
        'Generating vCards (BEGIN:VCARD) so a scan adds your contact info in one tap.',
      ],
      examples: [
        {
          title: 'A simple URL',
          input: 'https://debugdaily.online',
          output: 'A 25x25-module QR, version 2, error level M.',
          note: 'Short URLs fit in small QR codes that scan reliably even when printed tiny.',
        },
        {
          title: 'Wi-Fi join code',
          input: 'WIFI:T:WPA;S:GuestNet;P:hunter2;H:false;;',
          output: 'A QR that, when scanned, prompts to join GuestNet with password hunter2.',
          note: 'The format is standardized — most modern phones recognize WIFI: and offer a one-tap join.',
        },
      ],
      gotchas: [
        'Higher error correction (Q/H) makes the code more resilient to damage but stores less data per version. A long URL at level H may need a larger version, which means a larger printed code.',
        'Black-on-white scans more reliably than colored codes. Custom colors are fine for marketing but should keep a strong dark/light contrast — light foreground on dark background is non-standard and many scanners reject it.',
        'A logo in the center is supported by using a high error correction level (Q or H) and covering up to ~25% of the area. Cover more and scans start failing.',
        'Quiet zone matters. A QR code needs a white border at least 4 modules wide around it. Tools that crop the code tight will produce something that scanners struggle with.',
        'Tracking links inside QRs create extra cost — each scan goes through the redirect service, and a scan failure rate of even 1% adds up at scale. For printed forever-codes, prefer a direct URL.',
        'There is no expiry built into a QR. A QR printed today and discovered in 2032 will still try to load the URL — keep that in mind when deciding what to encode.',
      ],
      faq: [
        {
          q: 'Are these QR codes free to use commercially?',
          a: 'Yes. QR Code is a public specification, royalty-free since 1994 when Denso Wave released the patent. The codes generated here have no trademark, watermark, or licensing restriction.',
        },
        {
          q: 'How much data can a QR code hold?',
          a: 'At maximum (version 40, error level L) about 2,953 bytes for binary data or 4,296 alphanumeric characters. Practical limits are much lower — version 10 at level M holds about 200 characters and is the sweet spot for URLs.',
        },
        {
          q: 'Why does my Wi-Fi QR not work?',
          a: 'Three common causes: wrong T: value (it should be WPA, WEP, or nopass), unescaped special characters in the password (semicolons and colons need a backslash), or hidden SSID without H:true. Test on the device you will hand it to.',
        },
        {
          q: 'What is the right size to print?',
          a: 'A QR code should be at least 2 cm (0.8 inches) on a side at typical reading distance (arm\'s length). For posters or signs read from 3 meters away, scale up proportionally — 10× viewing distance roughly equals 10× minimum size.',
        },
        {
          q: 'Is my data sent anywhere?',
          a: 'No. The QR is generated entirely in your browser. The input text never leaves the tab.',
        },
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
        'Generates cryptographically random integers in any range using crypto.getRandomValues — the same OS-backed CSPRNG used by TLS, ssh-keygen and password managers. Pick a range, a count, whether duplicates are allowed, and how the output should be sorted. Suitable for tokens, giveaways and any other purpose where Math.random would be dangerous.',
      howItWorks: [
        'crypto.getRandomValues fills a typed array with bytes from the OS cryptographic source: getrandom on Linux, BCryptGenRandom on Windows, SecRandomCopyBytes on macOS. The same source that the kernel uses for /dev/urandom.',
        'To get a uniform integer in [min, max], the tool draws 32-bit unsigned values and rejects ones that would land in the "biased" final partial range — a technique called rejection sampling. The result is mathematically uniform; no value is more likely than any other.',
        'For "without duplicates" mode (e.g., picking 6 unique numbers from 1–49), the tool draws until enough distinct values are found. Efficient up to a few thousand picks from a million-element range; for picking N from a much larger N it switches to a Fisher–Yates shuffle on the candidate space.',
      ],
      useCases: [
        'Picking a winner for a giveaway or lottery in front of an audience — the result is verifiable, no Math.random tricks.',
        'Generating a list of seed values for property-based testing.',
        'Producing a random sample of row IDs from a known range.',
        'Simulating dice rolls or card draws for tabletop or game-balance work.',
        'Generating PIN codes or short numeric tokens (note: prefer longer alphanumeric tokens for security-sensitive cases).',
        'Bootstrapping a random ordering of items when you do not want a full deterministic seed.',
      ],
      examples: [
        {
          title: 'Six lottery numbers, 1–49, no duplicates',
          input: 'Range 1–49, Count 6, no duplicates',
          output: '3, 17, 22, 31, 38, 44',
          note: 'Sorted ascending for readability. Each draw is independent — past results never influence future ones.',
        },
        {
          title: 'A range with duplicates allowed',
          input: 'Range 1–10, Count 20, duplicates allowed',
          output: '7, 2, 9, 2, 5, 8, 1, 7, 3, 6, 10, 4, 7, 9, 2, 5, 8, 3, 1, 6',
          note: 'With only 10 possible values and 20 picks, duplicates are mathematically required.',
        },
      ],
      gotchas: [
        'Math.random is NOT cryptographically secure — it is a fast deterministic PRNG seeded from the system clock. Predictable, and unsafe for tokens, OTPs, session keys, anything an attacker cares about. This tool never uses it.',
        'For security-sensitive integers (PIN codes, OTP codes), 4 digits is brute-forceable in ten thousand tries. Use at least 6 digits for OTPs and pair with rate-limiting.',
        'Modulo bias matters when computing `random % N` directly — the lower indexes get slightly higher probability when N does not divide the random space evenly. This tool uses rejection sampling so the output is genuinely uniform; do not assume libraries elsewhere do the same.',
        'Drawing many "without duplicates" picks from a small range slows down toward the end. Picking 999,999 of 1,000,000 is essentially shuffling the whole range; pick the inverse (drop the 1 you do not want) for efficiency.',
        'A negative range (max < min) is treated as an error. Some other generators silently swap them; this one is explicit so a typo does not produce surprising output.',
      ],
      faq: [
        {
          q: 'Is this actually random or pseudo-random?',
          a: 'It is cryptographically random — derived from the OS entropy pool, which collects unpredictable inputs (interrupt timings, hardware noise) and feeds them through a cryptographic mixer. For practical purposes, indistinguishable from "true" random.',
        },
        {
          q: 'Can I reproduce a previous draw?',
          a: 'No — the OS CSPRNG does not accept a seed. If you need reproducible randomness for tests, use a seeded PRNG library (mulberry32, seedrandom). For audited giveaways, use a public-commitment scheme (commit hash beforehand, reveal seed after).',
        },
        {
          q: 'Why does my random number look "not random enough"?',
          a: 'Human intuition about randomness is wrong. Real random sequences contain clumps, repeats and "patterns" — that is the definition. Sequences that look random to humans (no repeats, well-spread) are actually less random because they have been filtered.',
        },
        {
          q: 'How big can the range be?',
          a: 'Up to ±2^53 (JavaScript\'s safe integer range). Beyond that, use a BigInt-based generator. Picking from any range smaller than that is uniform and fast.',
        },
        {
          q: 'Is the result fair for a public draw?',
          a: 'Yes, but transparency matters. For a contested draw, capture a screen recording of the input parameters and result, and publish them. Better still: use a verifiable randomness beacon (drand, NIST) so the output is auditable.',
        },
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
        'Converts any moment between multiple time zones at once using the browser-native Intl.DateTimeFormat API, the same engine your Node and Deno code use. The browser bundles the full IANA time zone database — currently 600+ named zones — so historical DST transitions and political changes (Russia abolishing DST in 2014, Lord Howe Island\'s half-hour shift) are handled correctly without a separate library.',
      howItWorks: [
        'A single moment in time is, internally, a Unix millisecond timestamp — independent of any zone. When you enter a date and time and pick a "from" zone, the tool parses the input as a wall-clock time in that zone and converts it to UTC.',
        'For each target zone, Intl.DateTimeFormat is invoked with a timeZone option and the UTC value is reformatted in that zone\'s local time. DST shifts, half-hour and 45-minute offsets (India, Nepal, Lord Howe), and historical changes are all handled by the browser\'s data.',
        'Adding or removing a zone re-renders only the affected row. No state is persisted — refresh and the picker starts from your local zone again. The intent is for ad-hoc conversion, not for saved world clocks.',
      ],
      useCases: [
        'Picking a meeting time that works for teams across continents without doing math in your head.',
        'Verifying when a deploy window opens in each region you operate in.',
        'Translating a UTC timestamp from a log into something a non-engineer can act on.',
        'Confirming when a customer in Sydney saw an outage relative to your UTC monitoring.',
        'Scheduling an Asia/Pacific code review at a time when both sides are awake.',
        'Resolving the "is this 9 AM or 9 PM their time?" ambiguity in async chat.',
      ],
      examples: [
        {
          title: 'NYC 10 AM → Tokyo / London / Sydney',
          input: 'America/New_York 2026-06-03 10:00',
          output:
            'Asia/Tokyo:        2026-06-03 23:00\nEurope/London:     2026-06-03 15:00 (BST)\nAustralia/Sydney:  2026-06-04 00:00',
          note: 'Tokyo does not observe DST; London and Sydney do. The tool handles the offset automatically.',
        },
        {
          title: 'DST transition gotcha',
          input: 'America/New_York 2026-03-08 02:30 (clocks spring forward at 2 AM)',
          output: 'Ambiguous: 02:30 does not exist on this day.',
          note: 'The 2:00–3:00 window is skipped during spring-forward. Conversions of times in that hour are ambiguous and the tool flags them rather than silently picking one.',
        },
      ],
      gotchas: [
        'IANA names are case-sensitive: America/New_York (not america/new_york, and not America/New-York). Use the lookup if you are not sure of the exact spelling.',
        'A moment like "2026-03-08 02:30" in America/New_York does not exist — that hour is skipped for DST. The tool flags ambiguous inputs rather than silently picking one of the two possible UTC values.',
        'Past dates use the historical DST rules at that point — usually correct, but confirm if you are investigating something pre-2000 in a country that has changed its rules since.',
        'Browsers update their tz database with new political changes (Egypt re-adopting DST, Lebanon\'s 2023 shift) at OS or browser update time. A very old device may have a slightly stale database.',
        'Three-letter abbreviations (PST, EST, IST) are ambiguous — IST is both India and Israel — and the spec deprecates them. Always use the full IANA name in code and config.',
        'UTC and GMT are nearly identical for any modern purpose but are not strictly the same. Use UTC for storage and timestamps; use GMT only when documents specifically call for it (UK rail schedules, some legal contexts).',
      ],
      faq: [
        {
          q: 'Why are IANA names like "America/New_York" instead of "EST"?',
          a: 'IANA names identify a region whose UTC offset changes over time (because of DST and political decisions). "EST" is just an offset (UTC-5). New York is on EST in winter and EDT in summer; "America/New_York" captures both.',
        },
        {
          q: 'Does the tool know about historical DST rules?',
          a: 'Yes — the browser\'s IANA database includes historical rules going back to the 1970s for most zones, and back further for major ones. Converting a date from 1985 in Detroit will use the rules in force then, not today\'s.',
        },
        {
          q: 'How do I find the right IANA name for my zone?',
          a: 'Common ones: America/New_York, America/Chicago, America/Los_Angeles, Europe/London, Europe/Paris, Asia/Tokyo, Asia/Kolkata, Australia/Sydney, UTC. The full list is at iana.org/time-zones. The Intl API accepts any of them.',
        },
        {
          q: 'Should I store timestamps in UTC or local time?',
          a: 'UTC, almost always. A Unix timestamp or ISO 8601 with a Z suffix is unambiguous and easy to convert at display time. Storing local time without an explicit zone is the source of every recurring meeting bug ever shipped.',
        },
        {
          q: 'How do I handle a recurring meeting across DST changes?',
          a: 'Store the meeting in the organizer\'s wall-clock zone (e.g., "every Tuesday 09:00 America/New_York") and convert at display time. Recurring rules expressed in UTC will drift relative to local wall-clock when DST shifts.',
        },
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
        'Skips the "remember the pipe-and-dash syntax" tax of writing markdown tables by hand. Edit cells in a familiar spreadsheet-style grid, set per-column alignment, add or remove rows, and copy out clean GitHub-Flavored Markdown ready to paste into a README, PR description, or issue comment. Paste CSV or TSV in and it autodetects the delimiter; paste an existing markdown table back and you can keep editing.',
      howItWorks: [
        'A markdown table is just three pieces of text: a header row of pipe-separated values, an alignment row of dashes and optional colons (`|---|:---:|---:|` for left/center/right), and one body row per data row. The tool serializes the edited grid back into that exact structure.',
        'Column widths in the source markdown are padded to the longest cell in each column so the raw text aligns even in a non-rendering editor. That is purely cosmetic — renderers ignore the padding.',
        'CSV import uses a small parser that handles quoted fields and embedded commas. TSV is detected by counting tabs vs commas in the first line. Both round-trip cleanly to markdown.',
      ],
      useCases: [
        'Adding a comparison table to a README without doing the pipe-and-dash arithmetic in your head.',
        'Converting a spreadsheet snippet into markdown for a PR description or release notes.',
        'Drafting documentation tables in a clean visual editor instead of in raw markdown.',
        'Migrating an internal wiki page from CSV-exported data to a markdown-based site (Docusaurus, Astro Starlight, Hugo).',
        'Producing a table for a GitHub issue from a quick CSV dump.',
        'Re-aligning the columns of a markdown table that got mangled by a copy-paste.',
      ],
      examples: [
        {
          title: 'A simple two-column comparison',
          input: 'Two columns, three rows, left-aligned',
          output:
            '| Feature      | Status |\n| ------------ | ------ |\n| Auth         | ✓      |\n| Webhooks     | ✓      |\n| Multi-tenant | WIP    |',
          note: 'GitHub, GitLab, Bitbucket, Notion, Obsidian and every static-site generator with markdown support all render this.',
        },
        {
          title: 'Column alignment',
          input: 'Three columns: left, center, right',
          output:
            '| Name  | Role     |  Score |\n| :---- | :------: | -----: |\n| Ada   | Engineer |    9.5 |\n| Grace | Designer |    9.2 |',
          note: 'Colons on either side of the dashes set alignment per column. Numeric columns usually look best right-aligned.',
        },
      ],
      gotchas: [
        'Pipe characters inside cells need to be escaped as `\\|` or the cell will be split on them. The editor escapes them automatically; if you hand-edit the output, watch for unescaped pipes in URLs.',
        'Some markdown renderers (Stack Overflow\'s older mode, RFC 7763 reference markdown) ignore the alignment row entirely. Confirm your target supports GitHub-Flavored Markdown — almost everything modern does.',
        'Multi-line cell content (with `<br>` or literal newlines) is GFM-specific. Strict markdown collapses everything to single lines. If your target is strict, use bullets or numbered lists inside the cell.',
        'Very wide tables (10+ columns) often look terrible on mobile rendering even when the markdown is correct. Consider splitting into multiple tables or using a definition list.',
        'Tables with empty cells need an explicit empty pipe-separated slot (` |`), not literally nothing. The editor keeps the spacing; hand-edits sometimes drop the empty cell.',
        'Code blocks inside cells are supported via inline code (backticks), but fenced code blocks (triple-backtick) inside a cell are NOT — they break the row structure.',
      ],
      faq: [
        {
          q: 'Is the table output GFM-compatible?',
          a: 'Yes. The output uses standard GitHub-Flavored Markdown table syntax. It renders correctly on GitHub, GitLab, Bitbucket, Notion, Obsidian, Hugo, Astro, Docusaurus, and any other markdown engine that implements GFM tables.',
        },
        {
          q: 'Can I edit a CSV file in the tool?',
          a: 'Yes — paste CSV into the editor and it autodetects the delimiter, builds a grid you can edit, and re-emits markdown when you copy.',
        },
        {
          q: 'How do I align numeric columns to the right?',
          a: 'Click the alignment toggle on the column header. The tool inserts `---:` on the right side of the dashes for that column, which renders right-aligned in GFM.',
        },
        {
          q: 'What is the maximum table size?',
          a: 'No hard limit, but markdown tables become unwieldy past about 8 columns or a few dozen rows. Past that, consider an HTML table or a separate JSON file.',
        },
        {
          q: 'Does the editor support cell formatting like bold and links?',
          a: 'Yes — markdown inside cells renders in the preview and ships in the output. Use `[text](url)` for links, `**bold**` for emphasis, backticks for inline code.',
        },
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
        'Pick two dates (or two date+time pairs) and the tool reports the gap between them in several useful ways at once: total seconds, minutes, hours, days and weeks; a calendar-aware breakdown ("1 year 2 months 5 days 6 hours"); and a working-days count that counts only Monday through Friday. Useful for project planning, contract math, SLA compliance windows, and answering "how long ago was X" without opening a spreadsheet.',
      howItWorks: [
        'The two inputs are parsed as JavaScript Date values. The total-difference figures (seconds, minutes, hours, days, weeks) come from a single subtraction of UTC milliseconds — these are exact and unambiguous.',
        'The calendar-aware breakdown uses calendar walking: starting from the earlier date, add whole years until you would overshoot, then whole months, then whole days, then hours/minutes/seconds. This is what most people mean when they say "2 years and 3 months apart".',
        'The working-days count iterates day by day between the two dates and skips Saturday and Sunday. It does NOT skip holidays — holidays vary by jurisdiction and would require a configurable database.',
      ],
      useCases: [
        'Counting working days between two project milestones.',
        'Sanity-checking a contract start/end period.',
        'Quickly answering "how long ago was…" without opening a spreadsheet or Stack Overflow.',
        'Computing a person\'s age in years and months from a birth date.',
        'Verifying an SLA window — "how long was the outage in business hours".',
        'Estimating elapsed time for an invoice or time-tracking entry.',
      ],
      examples: [
        {
          title: 'Calendar-aware breakdown',
          input: 'From: 2024-01-15  →  To: 2026-06-20',
          output:
            'Total: 887 days, 76,636,800 seconds\nBreakdown: 2 years, 5 months, 5 days\nWorking days: 633',
          note: 'The breakdown is what humans usually want. The total in seconds is what code usually wants.',
        },
        {
          title: 'A short gap',
          input: 'From: 2026-06-03 09:00  →  To: 2026-06-04 17:00',
          output:
            'Total: 32 hours, 1,920 minutes\nBreakdown: 1 day, 8 hours\nWorking days: 2',
          note: 'A 32-hour gap straddles a workday boundary, so the working-day count is 2.',
        },
      ],
      gotchas: [
        'Working-days count assumes Mon–Fri are workdays. It does NOT account for public holidays — Independence Day, Christmas, New Year, Easter and country-specific holidays all count as working days here. For HR-grade calculations, use a holiday-aware calendar.',
        'Months do not have a fixed number of days, so the "y/m/d" breakdown can shift if you swap the two dates. Going from Jan 31 to Feb 28 is "28 days" or "1 month"? The calendar walker says 1 month; total days says 28.',
        'Time zones can produce surprises. "2026-06-03" without a time is interpreted in your local zone. If two parties in different zones each enter "today", the gap might be hours off.',
        'Daylight Saving Time transitions add or remove an hour from the gap. A gap that spans the spring-forward boundary is 1 hour shorter in clock time than in elapsed time.',
        'Leap seconds are not modeled. They are effectively never visible in date math.',
        'Very long gaps (decades) can be computed but the calendar-aware breakdown may surprise people who expected a simple year count.',
      ],
      faq: [
        {
          q: 'Why does the year/month breakdown look weird?',
          a: 'Months and years have variable length. "1 year and 2 months" can mean 425 days or 427 days depending on which months are involved. The breakdown is the most natural human reading, not the most precise.',
        },
        {
          q: 'Can I include weekends in the working-day count?',
          a: 'Not currently. The tool always treats Saturday and Sunday as non-working. If your business runs 7 days, use the total-days figure instead.',
        },
        {
          q: 'Does this account for public holidays?',
          a: 'No. Holidays vary too much by country (and even by state within a country) to ship a default list. For HR or payroll-grade working-day counts, use a country-specific business-day library.',
        },
        {
          q: 'What is the difference between "total days" and the calendar "days" component?',
          a: 'Total days is just the raw count: 730 for two years. The calendar breakdown might say "2 years, 0 days" for the same gap — meaning two calendar years exactly, no leftover.',
        },
        {
          q: 'Can I use ISO 8601 timestamps?',
          a: 'Yes — `2026-06-03T09:00:00Z` works. Anything the browser Date constructor can parse is accepted. ISO with an explicit zone is the safest format.',
        },
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
        'Fill in a visual form — method, URL, headers, body, common flags — and the tool produces a properly shell-escaped `curl` command that is ready to paste into a terminal. Saves you the headache of escaping quotes by hand, ordering flags correctly, and remembering whether `-H` is repeatable. Equally useful for documenting an API call in a bug report, sharing a reproduction with a teammate, or generating a paste-ready command for a runbook or CI step.',
      howItWorks: [
        'On every change, the form state is serialized into a `curl` command line. The method becomes `-X METHOD`, each header becomes `-H "Name: Value"`, the body becomes `-d "..."` (with proper escaping), and any extra flags you toggle (follow redirects, ignore TLS errors, verbose) are appended.',
        'String escaping uses single-quotes by default — the safest in bash/zsh, since nothing inside single quotes is interpreted. Single quotes inside the value are handled with the `\\\'` trick (close quote, escape, single quote, reopen).',
        'Multi-flag commands are broken across lines with `\\` continuations once they exceed a threshold, so the output reads cleanly even when copied into a markdown code block.',
      ],
      useCases: [
        'Sharing an API call with a teammate without screenshotting Postman.',
        'Documenting a webhook reproduction in a bug report or Linear ticket.',
        'Generating a paste-ready command for a CI step or runbook.',
        'Translating a Postman or browser DevTools request into a curl one-liner.',
        'Producing a snippet for an API doc that shows how to call a specific endpoint.',
        'Building up complex requests with auth headers and body without escaping by hand.',
      ],
      examples: [
        {
          title: 'A standard POST with auth and JSON body',
          input:
            'Method: POST\nURL: https://api.example.com/users\nHeaders:\n  Authorization: Bearer eyJ...\n  Content-Type: application/json\nBody: {"name":"Jane","role":"admin"}',
          output:
            'curl -X POST \'https://api.example.com/users\' \\\n  -H \'Authorization: Bearer eyJ...\' \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"name":"Jane","role":"admin"}\'',
          note: 'Single-quoted strings, line continuations for readability. Paste verbatim into any bash/zsh terminal.',
        },
      ],
      gotchas: [
        'Body is sent as `-d` (which is `--data` in long form). That sends the body raw — it does NOT URL-encode. If you need form-encoded bodies, use `--data-urlencode` manually or switch the Content-Type.',
        'Generated quoting works for bash/zsh and most POSIX shells. Windows cmd users need to swap single quotes for double quotes (and escape internal double quotes), or use WSL / PowerShell.',
        'Some APIs reject curl\'s default User-Agent (`curl/x.y.z`) as suspicious. Add `-H "User-Agent: ..."` if you hit a 403.',
        'For binary uploads, use `--data-binary @file` instead of `-d` to prevent newline normalization. The visual form does not handle this — edit by hand.',
        'Long URLs with query strings should usually be URL-encoded. The tool does not encode the URL field; paste pre-encoded values if special characters are involved.',
        'curl follows redirects only when you pass `-L`. The form has a toggle; without it, you will see the redirect status, not the final response.',
      ],
      faq: [
        {
          q: 'What is the difference between -d and --data-raw?',
          a: '`-d` (--data) URL-encodes some characters by default in certain edge cases. `--data-raw` sends the body exactly as you provide it. For JSON bodies, `--data-raw` is safer. The tool uses `-d` for compactness but you can switch.',
        },
        {
          q: 'How do I send a file?',
          a: 'For multipart upload, use `-F "field=@/path/to/file"`. For raw binary uploads, use `--data-binary @/path/to/file`. The visual form does not currently support file uploads — edit the command by hand.',
        },
        {
          q: 'Why does my command work in Postman but fail with curl?',
          a: 'Usually one of: missing Content-Type header, cookies being sent in Postman but not by curl, or auth being added by a Postman environment that you forgot to copy over.',
        },
        {
          q: 'Can I use this for HTTPS APIs with self-signed certs?',
          a: 'Add the `-k` (insecure) flag to skip certificate verification. The visual form has a toggle. Only use this for development APIs you control.',
        },
        {
          q: 'Will the generated command work in PowerShell?',
          a: 'PowerShell aliases `curl` to `Invoke-WebRequest`, which uses different syntax. Run the actual curl binary with `curl.exe` and the bash-style syntax will work.',
        },
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
        'Translates between every common way of expressing Unix file permissions: octal (755), symbolic (rwxr-xr-x), and the chmod command syntax (u+x,g+r,o-w). Toggle the read/write/execute checkboxes for owner, group and other, and watch all three forms update in real time. Useful when you have memorized "755" but forgotten exactly what it gives each principal, or when you need to translate "executable, group-readable, world-private" into a number.',
      howItWorks: [
        'Unix file modes are 9 permission bits arranged as three triples (owner, group, other), each with read (r=4), write (w=2) and execute (x=1) flags. Sum the bits within each triple and you get the familiar octal: rwx = 7, rw- = 6, r-x = 5, r-- = 4, --x = 1, --- = 0.',
        'Three octal digits gives the standard 0–7 / 0–7 / 0–7 mode. A fourth leading digit, when present, encodes the special bits: setuid (4), setgid (2) and sticky (1). So 4755 is rwsr-xr-x — executable for owner with setuid, readable+executable for everyone.',
        'The tool converts between forms by storing the mode as a 12-bit integer internally and rendering each view from that single source of truth. Editing any view updates the others.',
      ],
      useCases: [
        'Remembering exactly why 755 is "executable for owner, readable+executable for everyone else".',
        'Setting up a deploy script that needs specific file modes (executables 755, configs 600, log directories 750).',
        'Translating between rwxr-xr-x and 755 in either direction without counting bits in your head.',
        'Computing the right mode for an SSH private key (600) or an SSH directory (700) to satisfy strict-mode openssh.',
        'Picking the umask that produces a desired default file/directory mode.',
        'Reading the verbose output of `ls -l` faster by recognizing the mode at a glance.',
      ],
      examples: [
        {
          title: 'The canonical 755',
          input: 'Checked: owner rwx, group rx, other rx',
          output:
            'Octal: 755\nSymbolic: rwxr-xr-x\nchmod 755 file.sh\nchmod u=rwx,go=rx file.sh',
          note: 'Standard mode for executables and directories — owner does anything, everyone else can read and traverse.',
        },
        {
          title: 'SSH private key (600)',
          input: 'Checked: owner rw, group nothing, other nothing',
          output:
            'Octal: 600\nSymbolic: rw-------\nchmod 600 ~/.ssh/id_rsa',
          note: 'OpenSSH refuses to use a private key with looser permissions. Set this exactly or ssh will print "Permissions are too open" and refuse.',
        },
        {
          title: 'Setuid binary (4755)',
          input: 'Octal: 4755',
          output:
            'Symbolic: rwsr-xr-x\nchmod 4755 binary',
          note: 'The lowercase s indicates setuid + executable. Used by sudo, ping, passwd — programs that need to run with elevated privileges.',
        },
      ],
      gotchas: [
        'The leading 0 in a four-digit octal (0755) is a C-language convention — in chmod itself, the number is always octal so the leading 0 is optional. With the leading 0 it is clearly octal in source code.',
        'A file with execute permission but no read permission is uncommon and usually accidental — you cannot execute a script you cannot read. Compiled binaries can run with --x because the kernel needs only the execute bit.',
        'Setuid scripts are ignored by Linux by design. The setuid bit on a #!/bin/sh file does nothing. Use a small C wrapper or a tool like sudo.',
        'On directories, the execute bit means "may traverse" (cd into and look up entries by name). The read bit means "may list contents". A directory with x but no r can be cd-d into but ls will refuse.',
        'The sticky bit on a directory (1, last digit) means "only the owner of a file in this dir may delete or rename it". This is what protects /tmp from one user deleting another user\'s files.',
        'umask subtracts permissions from a default. A umask of 022 produces files at 644 (666-022) and directories at 755 (777-022). A umask of 077 produces 600 files and 700 directories — the standard for private home directories.',
      ],
      faq: [
        {
          q: 'Why is execute = 1 and not 3?',
          a: 'The values 4/2/1 are chosen to be distinct bits so summing never causes a carry: rwx = 4+2+1 = 7, rw = 6, rx = 5, etc. No two permission combinations produce the same number.',
        },
        {
          q: 'What does 777 mean and why is it bad?',
          a: '777 grants read, write and execute to everyone. On any directory accessible to multiple users, that is a security hole — anyone can replace any file. Use 777 only for directories meant to be world-writable (uncommon outside of /tmp, which uses 1777 with the sticky bit).',
        },
        {
          q: 'What is the difference between chmod 600 and chmod u=rw,go=?',
          a: 'They produce the same result, expressed differently. 600 is absolute (sets the mode to exactly this). u=rw,go= is also absolute. u+rw,go-rwx would be relative — add rw to user, remove rwx from group and other from whatever the current mode is.',
        },
        {
          q: 'When do I use 644 vs 755?',
          a: '644 (rw-r--r--) for regular files that should be readable but not executable. 755 (rwxr-xr-x) for executables and directories. Setting a non-executable file to 755 is harmless; setting an executable to 644 makes it unrunnable.',
        },
        {
          q: 'What is umask?',
          a: 'A mask of permissions that newly created files and directories will NOT have. Umask 022 means new files default to 644 (since they start at 666 and 022 is subtracted) and directories to 755 (777 - 022). Set in your shell rc file.',
        },
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
        'Converts a JSON array of objects into a CSV that opens cleanly in Excel, Google Sheets, Numbers or any data-analysis tool. The tool inspects the union of keys across all objects to build the column header, optionally flattens nested objects with dot-notation columns, and quotes fields per RFC 4180 so embedded commas, quotes and newlines round-trip safely. Choose the delimiter (comma, semicolon, tab) for your locale.',
      howItWorks: [
        'The JSON is parsed and the tool collects every distinct key from every object in the array. Those keys become the header row. Each object\'s row contains the value for each header, or empty if the object did not have that key.',
        'Nested objects (when "Flatten" is enabled) are recursively unpacked: `{user: {name: "Jane"}}` becomes a column called `user.name`. Nested arrays become JSON-string cells unless they are leaf-primitive arrays (those become semicolon-joined strings, but this is configurable).',
        'CSV escaping follows RFC 4180: fields containing the delimiter, a double quote, or a newline are wrapped in double quotes; internal quotes are doubled. The result is parseable by every standards-compliant CSV library.',
      ],
      useCases: [
        'Importing an API response into a spreadsheet for ad-hoc analysis.',
        'Preparing data for `pandas.read_csv` or `awk` pipelines.',
        'Quickly diffing two JSON datasets with column-by-column eyes (CSV diff is more readable than JSON diff).',
        'Producing a billing or audit export from a JSON log.',
        'Bulk-loading data into a database via COPY FROM.',
        'Sharing a JSON snapshot with non-technical stakeholders.',
      ],
      examples: [
        {
          title: 'Simple flat array',
          input: '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob","role":"admin"}]',
          output: 'id,name,role\n1,Alice,\n2,Bob,admin',
          note: 'The header is the union of keys across all objects. Missing fields become empty cells.',
        },
        {
          title: 'Flattening a nested object',
          input: '[{"id":1,"user":{"name":"Alice","email":"a@e.com"}}]',
          output: 'id,user.name,user.email\n1,Alice,a@e.com',
          note: 'With Flatten on, nested objects unpack to dot-prefixed columns. Without Flatten, the user column would contain a JSON string.',
        },
      ],
      gotchas: [
        'Nested arrays inside objects become JSON-string cells by default. For tabular nested data, transform the array into one row per item before converting.',
        'Excel\'s CSV import sometimes mis-detects the delimiter, especially in regions where the spreadsheet locale uses semicolons. If columns look concatenated in Excel, choose the semicolon delimiter and re-export.',
        'CSV has no native date type. Date values come out as whatever string they were in the JSON. Excel may auto-coerce strings that look like dates, which is sometimes wrong.',
        'A leading equals sign in a cell (like `=2+2`) is a CSV injection risk in Excel. The tool prefixes such values with a single quote to neutralize it.',
        'Very large arrays (100,000+ rows) work but may take a few seconds. For multi-million-row exports, use a streaming tool like `jq` + `mlr`.',
        'Round-tripping CSV → JSON → CSV is generally lossy because types disappear when JSON values stringify into CSV cells.',
      ],
      faq: [
        {
          q: 'What delimiter should I use?',
          a: 'Comma is the default and what most tools expect. Semicolon is common in European Excel locales (German, French). Tab is best when fields commonly contain commas or quotes.',
        },
        {
          q: 'How does flattening work for arrays of objects?',
          a: 'Arrays of primitive values can be joined with semicolons (configurable). Arrays of objects do not flatten cleanly into a 2D table — instead, the array becomes a JSON-string cell. To get a row per nested item, transform the JSON first.',
        },
        {
          q: 'Will my CSV open correctly in Excel?',
          a: 'For ASCII content with comma delimiter, yes. For non-Latin characters, add a UTF-8 BOM at the start (the tool can do this) so Excel detects the encoding correctly.',
        },
        {
          q: 'Can I go back from CSV to JSON?',
          a: 'Yes, with the inverse tool elsewhere in the suite (or using `pandas.read_csv(...).to_json(orient="records")`). Round-tripping loses type information — everything becomes strings unless the consumer re-types.',
        },
        {
          q: 'Is my JSON uploaded?',
          a: 'No. The conversion runs entirely in your browser.',
        },
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
        'Pastes JSON and produces clean YAML with proper indentation, multi-line strings, and block-scalar style for long values. Useful for converting JSON snippets into Kubernetes manifests, Docker Compose files, GitHub Actions workflows or any YAML-first ecosystem. Round-trips through js-yaml so the YAML is canonical and parses back to identical JSON on round-trip.',
      howItWorks: [
        'The JSON is parsed into a JavaScript object using JSON.parse. The resulting tree is then dumped to YAML using js-yaml\'s safe-dump, which respects YAML 1.2 rules and produces output every modern YAML parser accepts.',
        'Indentation is configurable (typically 2 spaces, which matches Kubernetes conventions). Long strings are emitted with the `|` literal-block style by default so they read naturally in the output.',
        'JSON null becomes YAML null (or ~ depending on style). JSON empty arrays/objects become `[]` and `{}` respectively, which YAML supports as flow style.',
      ],
      useCases: [
        'Translating a JSON config into a Kubernetes manifest.',
        'Migrating from a JSON-based config to YAML (or comparing them side by side).',
        'Quickly diffing two configs in YAML form — large nested objects are more readable in YAML than minified JSON.',
        'Converting a JSON payload from an API into a fixture YAML file for a test.',
        'Generating a starting-point Helm values.yaml from a JSON sample.',
        'Producing a GitHub Actions workflow YAML from a JSON template.',
      ],
      examples: [
        {
          title: 'A K8s-style deployment',
          input:
            '{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"name":"web"},"spec":{"replicas":3,"selector":{"matchLabels":{"app":"web"}}}}',
          output:
            'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web',
          note: '2-space indent is the Kubernetes convention. Quotes around values are dropped where the YAML 1.2 spec permits.',
        },
      ],
      gotchas: [
        'YAML 1.1 vs 1.2 differences (the Norway problem — "no" being parsed as boolean false in 1.1) mean a JSON string "no" might round-trip differently in tools still on YAML 1.1. This tool emits 1.2 strict output.',
        'Multi-line strings in JSON (with embedded newlines) become YAML block scalars. If your downstream consumer cannot handle `|`, switch to flow-style by setting an appropriate flag (manual edit).',
        'JSON has no native dates, so date-looking strings round-trip as strings. If you want them to become YAML date types, post-process by hand.',
        'Anchors and aliases (&name / *name) are YAML-only features that have no JSON equivalent. Converting JSON to YAML never produces them; if you want them, refactor by hand after conversion.',
        'JSON null becomes YAML null. Some K8s consumers prefer empty string instead — adjust if you hit issues.',
        'Very deep nesting (50+ levels) produces deep YAML indentation that can be hard to read. Consider restructuring at the source.',
      ],
      faq: [
        {
          q: 'Is the output valid YAML for Kubernetes?',
          a: 'Yes, assuming the input is valid Kubernetes JSON. The tool produces standard YAML 1.2 that kubectl, helm, and every K8s client accepts.',
        },
        {
          q: 'Can I round-trip JSON → YAML → JSON without loss?',
          a: 'Yes for primitive types and structure. Comments and YAML-specific features (anchors, tags, block-scalar flavors) are not in the JSON source so are not preserved.',
        },
        {
          q: 'Why are some strings quoted and others not?',
          a: 'YAML 1.2 allows unquoted strings unless they are ambiguous (could be parsed as a number, boolean, or null) or contain special characters. The tool quotes only when necessary, matching the convention.',
        },
        {
          q: 'How do I convert YAML back to JSON?',
          a: 'Use the YAML Validator tool, which produces JSON output from YAML input.',
        },
        {
          q: 'Is the conversion lossless for arrays?',
          a: 'Yes. JSON arrays become YAML sequences (either `- item` style or `[item]` flow style depending on settings).',
        },
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
        'Pretty-prints or minifies XML with proper nesting and indentation while validating the structure as it goes. Built on the browser\'s native DOMParser, so it handles namespaces, attributes, comments, CDATA blocks and processing instructions correctly. Useful for reading SOAP envelopes from logs, inspecting RSS/Atom feeds, deciphering an `AndroidManifest.xml`, or producing a clean version for diffing.',
      howItWorks: [
        'DOMParser parses the input into a DOM tree, which surfaces well-formed errors with line numbers. If parsing succeeds, the tree is serialized back with insertions of newlines and indentation at every element boundary.',
        'Pretty-printing produces one tag per line with consistent indentation (configurable, typically 2 spaces). Minifying does the opposite — strips all insignificant whitespace between tags. Round-tripping preserves semantics; only whitespace changes.',
        'Comments (`<!-- … -->`) and CDATA blocks (`<![CDATA[…]]>`) are preserved verbatim. Their internal whitespace is untouched because changing it could alter meaning.',
      ],
      useCases: [
        'Reading SOAP envelopes copied from a server log.',
        'Inspecting an Android `strings.xml` or `AndroidManifest.xml` that has been minified for build.',
        'Diffing two RSS feeds for changes after a feed-generator update.',
        'Cleaning up an SVG file that has been minified by a build tool.',
        'Producing a readable version of a Maven `pom.xml` snippet for documentation.',
        'Validating that a third-party-supplied XML config is well-formed before deploying.',
      ],
      examples: [
        {
          title: 'Pretty-printing minified XML',
          input: '<users><user id="1"><name>Alice</name><email>a@e.com</email></user></users>',
          output:
            '<users>\n  <user id="1">\n    <name>Alice</name>\n    <email>a@e.com</email>\n  </user>\n</users>',
          note: 'Self-contained elements stay on one line; nested structure is indented.',
        },
        {
          title: 'A malformed input',
          input: '<root><unclosed>',
          output: 'Error: unclosed tag at line 1 column 17',
          note: 'DOMParser surfaces well-formed errors with their position so you can jump to the spot.',
        },
      ],
      gotchas: [
        'CDATA blocks and embedded XML processing instructions are preserved verbatim, not deeply re-indented. CDATA exists to carry verbatim text — modifying its whitespace would defeat the point.',
        'XML namespaces are preserved but namespace prefixes are NOT normalized. If your document mixes `xs:` and `xsd:` for the same namespace URI, the formatter does not unify them.',
        'Self-closing tags follow the input convention. `<br/>` stays self-closing; `<br></br>` stays as paired tags. Some downstream consumers care about this distinction.',
        'Encoding declarations in the XML prolog (`<?xml version="1.0" encoding="UTF-8"?>`) are preserved but the tool always operates on UTF-8 strings.',
        'For very large XML files (megabytes), DOMParser may pause the tab during parsing. Streaming XML parsers are not available in the browser; use xmllint from the command line.',
        'XML 1.1 has slightly different rules than XML 1.0 (notably character escapes). DOMParser targets XML 1.0; XML 1.1 documents may produce warnings.',
      ],
      faq: [
        {
          q: 'Does this validate against a schema (XSD, DTD, RelaxNG)?',
          a: 'No — the tool validates that the XML is well-formed (tags balance, attributes quoted, no illegal characters), but does not check against a schema. For schema validation, use xmllint or a language-specific XSD validator.',
        },
        {
          q: 'How does it handle XML namespaces?',
          a: 'Namespace declarations and prefixes are preserved verbatim. The tool does not normalize differing prefixes that point at the same URI.',
        },
        {
          q: 'Can I format XML that has invalid characters?',
          a: 'XML has a strict character set (excluding control characters except tab/newline/CR). Files with stray control characters produce a parse error. Strip the bad bytes first.',
        },
        {
          q: 'Why does my SOAP envelope look different after formatting?',
          a: 'Whitespace inside elements may be significant for some SOAP processors. If the envelope worked before formatting and stopped after, your processor is treating the new whitespace as content. Use the minify option to strip it back.',
        },
        {
          q: 'Is my XML uploaded?',
          a: 'No. DOMParser runs in your browser. Nothing is sent to any server.',
        },
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
        'Computes HMAC (keyed-Hash Message Authentication Code) signatures for any message and secret combination, using HMAC-SHA-1, SHA-256, SHA-384 or SHA-512. HMAC is what every modern webhook provider uses to prove a request came from them and was not tampered with — Stripe, GitHub, Slack, Shopify, Twilio, all use the same primitive with their own secret. The tool runs entirely in your browser through WebCrypto, so the secret never leaves the tab.',
      howItWorks: [
        'HMAC wraps a regular hash function with a secret in a specific construction: HMAC(K, m) = H((K ⊕ opad) || H((K ⊕ ipad) || m)). The two xor masks (ipad = 0x36, opad = 0x5C) prevent length-extension attacks that a naive H(K || m) would allow.',
        'The output is the same size as the underlying hash — 32 bytes for HMAC-SHA-256, 64 bytes for HMAC-SHA-512. The tool shows both hex (the standard for `X-Signature` headers) and base64 (used by some providers like Slack).',
        'WebCrypto handles the implementation natively: importKey on the secret, sign with the message, format the result. The same code your backend uses to verify is what runs in the browser, so signatures match byte-for-byte.',
      ],
      useCases: [
        'Reproducing the signature a webhook provider sent you, to verify their docs match reality.',
        'Generating a test signature for your own webhook implementation so your verifier can be tested without live traffic.',
        'Debugging a "signature mismatch" error by computing the signature locally and comparing to what your server received.',
        'Signing a short-lived URL with your secret so it cannot be tampered with by the recipient.',
        'Generating a deterministic API request signature to use in a test harness or load generator.',
        'Producing a fingerprint of a payload that any party with the secret can recompute, but no other party can forge.',
      ],
      examples: [
        {
          title: 'Stripe-style webhook signature',
          input:
            'Secret: whsec_test_secret\nMessage: 1740000000.{"id":"evt_123","type":"charge.succeeded"}\nAlgorithm: SHA-256',
          output:
            'Hex: 9f8e7d6c5b4a39281706f5e4d3c2b1a0…\nBase64: n45t1lJtT…',
          note: 'Stripe prefixes the signed payload with the Unix timestamp and a dot — concatenated as shown. The verifier rebuilds the same string and compares signatures.',
        },
        {
          title: 'GitHub-style webhook signature',
          input:
            'Secret: my-webhook-secret\nMessage: <raw request body bytes>\nAlgorithm: SHA-256',
          output: 'sha256=8e1f2d4c…',
          note: 'GitHub prepends sha256= to the hex digest in the X-Hub-Signature-256 header. Your code re-computes HMAC and compares the parts after the prefix.',
        },
      ],
      gotchas: [
        'HMAC is sensitive to the exact bytes of the secret and message. Whitespace, trailing newlines, and encoding all matter. A "valid" JSON payload that was re-serialized has different bytes than the original.',
        'Many providers sign the raw request body, not a parsed/re-serialized version. If your web framework re-stringifies the body, your computed signature will not match. Capture the original bytes at the wire level.',
        'The secret is sometimes a base64-encoded value, not the raw bytes. If your provider gave you a long string of mixed-case + digits + slashes, decode the base64 before passing it as the HMAC key.',
        'HMAC verification on the server should use a constant-time comparison (crypto.timingSafeEqual in Node, hmac.compare_digest in Python). A naive == is timing-attack vulnerable.',
        'HMAC-SHA-1 is still widely used (it remains secure for MAC purposes despite SHA-1 being broken for collision resistance), but most new providers use SHA-256 by default. Match what the documentation says exactly.',
        'A signature only proves the message came from someone with the secret. It does not provide forward secrecy — if the secret leaks, every past signature is forgeable.',
      ],
      faq: [
        {
          q: 'What is HMAC and why not just SHA-256(secret + message)?',
          a: 'Naive H(secret || message) is vulnerable to length-extension attacks: an attacker can append data and produce a valid hash without knowing the secret. HMAC uses two nested hashes with specific xor masks to prevent that. Always use HMAC, never raw hash with a prepended secret.',
        },
        {
          q: 'Should I use SHA-1 or SHA-256?',
          a: 'SHA-256 if you have the choice. HMAC-SHA-1 is still secure for MAC purposes — there is no practical attack — but SHA-1 is deprecated everywhere else and SHA-256 has no meaningful downside.',
        },
        {
          q: 'How do I verify a webhook signature?',
          a: 'Recompute HMAC(secret, raw_request_body) on your server with the same algorithm, then compare in constant time to the header value the provider sent. Reject anything that does not match. Treat the request as untrusted until verification passes.',
        },
        {
          q: 'Why does my hex output not match the provider\'s?',
          a: 'In rough order of frequency: wrong algorithm (SHA-256 vs SHA-1), wrong secret encoding (you used the displayed string instead of base64-decoding it), wrong message format (re-serialized JSON instead of raw bytes), wrong delimiter between fields (provider uses tab, you used newline).',
        },
        {
          q: 'Is my secret sent to any server?',
          a: 'No. WebCrypto runs HMAC entirely in your browser. The secret never leaves this tab.',
        },
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
        'A full RFC 6238 Time-based One-Time Password generator running entirely in your browser via WebCrypto. Paste a base32 secret — the same string a service shows you when enabling 2FA — and the tool produces the 6-digit code that Google Authenticator, 1Password, Authy or Bitwarden would produce at the same moment. A countdown bar shows how many seconds until the next rotation, and the next code is previewed so you do not race the clock.',
      howItWorks: [
        'TOTP is HOTP (RFC 4226) with a time-derived counter. Every 30 seconds (by convention), the counter advances by 1: counter = floor(unix_seconds / period). The tool reads the browser\'s clock to derive the current counter.',
        'The counter is encoded as an 8-byte big-endian integer and fed, along with the base32-decoded secret, into HMAC-SHA1 (or SHA-256 / SHA-512 if your provider chose those). The output is a 20-byte (or longer) MAC.',
        'A "dynamic truncation" step picks the offset specified by the low 4 bits of the final byte, reads 4 bytes starting there, masks off the top bit, and reduces modulo 10^digits. That gives you the 6-digit code most people see.',
      ],
      useCases: [
        'Testing 2FA login flows during development without setting up Google Authenticator on every test device.',
        'Verifying a secret a provider gave you actually generates the codes they expect — useful when migrating from one authenticator app to another.',
        'Building a one-off CI script that needs an OTP to log into a service that requires 2FA.',
        'Recovering from an authenticator app you no longer have access to, when you saved the underlying secret.',
        'Generating codes for accounts on devices that cannot run an authenticator app.',
        'Debugging an integration where your service is rejecting otherwise-correct TOTP codes (often clock skew).',
      ],
      examples: [
        {
          title: 'A standard Google-Authenticator-style secret',
          input: 'JBSWY3DPEHPK3PXP (SHA-1, 6 digits, 30s)',
          output: 'Current code: 287082\nNext code: 614733\nResets in: 7s',
          note: 'Defaults: SHA-1, 6 digits, 30-second period. Almost every service uses exactly these. The countdown shows how long until the code rotates.',
        },
        {
          title: 'An 8-digit, 60-second variant',
          input: 'JBSWY3DPEHPK3PXP (SHA-256, 8 digits, 60s)',
          output: 'Current code: 12345678\nResets in: 41s',
          note: 'Some enterprise providers (Microsoft Authenticator on certain configs) use longer codes and longer periods. The secret format is the same; only the algorithm and parameters change.',
        },
      ],
      gotchas: [
        'The secret must be base32 (RFC 4648), uppercase letters A–Z and digits 2–7. Some providers add spaces every 4 characters for readability — strip them. Lowercase usually works because tools normalize.',
        'Default for Google Authenticator, 1Password, Authy, Bitwarden, Microsoft Authenticator is SHA-1 + 6 digits + 30s. Do not change these unless your provider explicitly says otherwise — a mismatch produces "wrong code" errors with no diagnostic.',
        'Server-side TOTP verification typically accepts the previous, current and next code (a "window" of ±1) to tolerate clock skew. If your tool shows the right code but the server rejects it, your clock might be more than 30 seconds off from the server\'s.',
        'TOTP secrets in an `otpauth://` URI also encode the algorithm, digits and period as query parameters. The QR codes you scan during 2FA setup embed those — if you only copy the secret, you lose the non-default parameters.',
        'The 6 digits in a TOTP code do NOT carry 20 bits of entropy. They are a truncation of a longer MAC, so the security comes from the secret\'s length and the short validity window, not from the code itself.',
        'TOTP relies on shared time. If your client and server clocks drift by more than your tolerance window, every code will look wrong. NTP is your friend.',
      ],
      faq: [
        {
          q: 'What is the difference between TOTP and HOTP?',
          a: 'HOTP (RFC 4226) increments a counter on each use. TOTP (RFC 6238) is HOTP with a time-derived counter — every 30 seconds, the counter advances by 1. TOTP is what authenticator apps generate; HOTP shows up in some hardware tokens.',
        },
        {
          q: 'Is my secret sent anywhere?',
          a: 'No. WebCrypto runs HMAC entirely in your browser. The secret never leaves the tab. Same as your authenticator app, just in a webpage.',
        },
        {
          q: 'Why does my provider show "wrong code"?',
          a: 'In order of frequency: clock drift between your device and the server, wrong digit count (most are 6 but some use 8), wrong period (most are 30s but some use 60s), wrong algorithm (most are SHA-1 — almost no one uses SHA-256 even though it is "better"). Check the otpauth:// URI for the actual parameters.',
        },
        {
          q: 'Can I use TOTP without a phone?',
          a: 'Yes. TOTP only needs a place to store the secret and compute the HMAC. Browser-based generators, password manager integrations (1Password, Bitwarden), hardware keys (YubiKey OATH) and CLI tools (oathtool) all work.',
        },
        {
          q: 'Is TOTP secure?',
          a: 'TOTP is significantly better than passwords alone, but it is phishable — a fake login page can ask for your code and replay it within 30 seconds. WebAuthn / passkeys are phishing-resistant and are the modern recommendation for high-value accounts. TOTP remains a strong second factor for everything else.',
        },
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
  {
    slug: 'mermaid',
    name: 'Mermaid Diagram Renderer',
    description: 'Render flowcharts, sequence, class, ER, state, gantt and pie diagrams from Mermaid text.',
    category: 'generate',
    keywords: ['mermaid', 'diagram', 'flowchart', 'sequence', 'er', 'gantt', 'uml'],
    Component: lazy(() => import('../tools/mermaid')),
    seo: {
      title: 'Mermaid Diagram Renderer Online — Flowchart, Sequence, ER, Gantt',
      description:
        'Render Mermaid diagrams live in your browser. Flowcharts, sequence, class, state, ER, gantt and pie. Download as SVG or PNG. Source never leaves the tab.',
    },
    content: {
      about:
        'Mermaid is a tiny text-based diagram language that turns plain syntax like flowchart TD or sequenceDiagram into clean, professional SVG diagrams. This renderer compiles your Mermaid source in your browser the same way GitHub, GitLab and Notion do — so what you see here is what those platforms will show. Source and rendered SVG never leave the tab.',
      howItWorks: [
        'On every change, the tool loads the Mermaid library (lazily — only the first time you open this page), feeds your source through mermaid.parse to surface syntax errors, then calls mermaid.render to produce a self-contained SVG string.',
        'The renderer uses securityLevel: "strict", which disables click handlers and inline scripts inside the rendered SVG — important because Mermaid does interpret some user-supplied attributes. You can paste in untrusted source without worrying about XSS.',
        'Download as SVG copies the raw vector output, or PNG rasterizes the SVG to a 2x-density bitmap with a matching background — useful for slide decks or anywhere that doesn\'t accept SVG.',
      ],
      useCases: [
        'Sketching a sequence diagram for an architectural review without opening Lucidchart.',
        'Building a state machine for documentation before committing it to the codebase.',
        'Converting a hand-drawn whiteboard flowchart into something pasteable into a GitHub README.',
        'Producing an ER diagram from your schema spec for a design doc.',
        'Drafting a release gantt chart in code so it survives in version control.',
        'Generating a quick pie chart of issue categories from a triage session.',
      ],
      examples: [
        {
          title: 'A minimal flowchart',
          input: 'flowchart TD\n  A[Start] --> B{OK?}\n  B -- Yes --> C[Done]\n  B -- No  --> D[Retry]',
          output:
            'SVG of a three-decision flowchart (Start → branch → Done / Retry).',
          note: 'TD = top-down. LR = left-to-right. BT and RL also work.',
        },
        {
          title: 'Sequence diagram',
          input:
            'sequenceDiagram\n  Browser->>API: POST /login\n  API->>DB: SELECT user\n  DB-->>API: row\n  API-->>Browser: 200 + JWT',
          output: 'SVG of a four-message sequence diagram with three lifelines.',
          note: '->> is a solid arrow (call). -->> is dashed (return).',
        },
      ],
      gotchas: [
        'Mermaid syntax errors are sometimes cryptic. If the preview fails, try removing the most recent line — most failures are caused by a missing dash, arrow, or pipe.',
        'Large diagrams (hundreds of nodes) render slowly because each shape is laid out individually. Break big diagrams into multiple smaller ones.',
        'Some diagram types accept identifiers with special characters only if they are quoted. If a flowchart node label contains a colon or parenthesis, wrap the label in quotes.',
        'Mermaid version drift matters. Diagrams that work on GitHub may use newer syntax than this renderer if Mermaid has updated since the page was built. Refresh if you suspect a version issue.',
        'PNG download uses canvas-based rasterization, which means custom web fonts may not embed identically. For pixel-perfect output, use SVG and embed the font separately.',
      ],
      faq: [
        {
          q: 'What diagram types are supported?',
          a: 'Flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, pie, mindmap, gitGraph, journey, requirementDiagram, timeline, c4Context — basically every type Mermaid supports. The sample chips at the top of the page give you a starting point for the common ones.',
        },
        {
          q: 'Is my diagram source uploaded anywhere?',
          a: 'No. The Mermaid library runs in your browser; both your source and the rendered SVG stay in this tab.',
        },
        {
          q: 'Can I use this for documentation that lives in GitHub?',
          a: 'Yes. The Mermaid version we render with is one of the recent stable releases, so anything that renders here should render in GitHub, GitLab and Notion. If you hit a version gap, simplify to a syntax that has been supported for a while.',
        },
        {
          q: 'How do I change the theme?',
          a: 'The renderer uses a dark theme to match the site. To export with a different theme, add a %%{init: {"theme": "default"}}%% directive at the top of your Mermaid source — Mermaid will honor it.',
        },
        {
          q: 'Why does my diagram look slightly different from GitHub?',
          a: 'GitHub pins a specific Mermaid version that may be older or newer than the one this tool bundles. Layout heuristics can differ between minor versions. The structure will be the same.',
        },
      ],
    },
  },
  {
    slug: 'pem-decoder',
    name: 'X.509 Certificate Decoder',
    description: 'Decode a PEM-encoded TLS certificate. Subject, issuer, validity, SAN, fingerprints.',
    category: 'inspect',
    keywords: ['x509', 'certificate', 'pem', 'tls', 'ssl', 'cert', 'fingerprint'],
    Component: lazy(() => import('../tools/pem-decoder')),
    seo: {
      title: 'X.509 / PEM Certificate Decoder Online — Subject, Issuer, SAN, Expiry',
      description:
        'Paste a PEM-encoded TLS certificate and see subject, issuer, serial, validity, SAN, signature algorithm, public key, SHA-1 and SHA-256 fingerprints. All client-side.',
    },
    content: {
      about:
        'Pastes a PEM-encoded X.509 certificate (anything between -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----) and turns it into human-readable fields: subject, issuer, validity window, subject alternative names, key type and size, signature algorithm, serial number, and SHA-1/SHA-256 fingerprints. Decoding happens in your browser via the @peculiar/x509 library; the certificate never leaves the tab.',
      howItWorks: [
        'A PEM certificate is just a base64-encoded DER blob wrapped in BEGIN/END markers. The tool strips the markers, base64-decodes the body, and hands the raw ASN.1 bytes to a real X.509 parser that walks the structure.',
        'The parser pulls out the standard fields defined by RFC 5280 — version, serial, signature algorithm, issuer DN, validity, subject DN, public key info — plus any extensions present (SAN is by far the most common).',
        'Fingerprints are computed with WebCrypto by hashing the entire DER blob with SHA-1 and SHA-256. These are the same hex strings you would get from running `openssl x509 -fingerprint -sha256` on the file.',
      ],
      useCases: [
        'Confirming which hostname a TLS certificate actually covers before deploying it.',
        'Checking when a production certificate expires so you can rotate before downtime.',
        'Comparing the SHA-256 fingerprint your server sends against the one your monitoring service expects (certificate pinning).',
        'Verifying that a self-signed CA you generated has the right subject and validity window.',
        'Reading the issuer field of a chain certificate during a TLS-debugging session.',
        'Deciphering a customer-uploaded cert without opening a terminal.',
      ],
      examples: [
        {
          title: 'A typical Let\'s Encrypt cert',
          input: '-----BEGIN CERTIFICATE-----\n(base64 of DER bytes)\n-----END CERTIFICATE-----',
          output:
            'Subject: CN=example.com\nIssuer: CN=R3, O=Let\'s Encrypt\nSerial: 03:81:7F:2A:…\nValid: 2026-01-15 → 2026-04-15 (62 days)\nSAN: example.com, www.example.com\nKey: RSA 2048\nFingerprint SHA-256: 9F:8E:…',
          note: 'Subject is the cert\'s identity. SAN is the list of hostnames the cert is actually valid for.',
        },
      ],
      gotchas: [
        'PEM files often contain multiple certs concatenated (a chain). This tool decodes the first cert in the input. To inspect a chain, paste one cert at a time.',
        'Decoding does not verify trust. A cert with a perfectly valid structure can still be untrusted because its issuer is unknown or its chain is broken.',
        'Subject alternative names are the real source of truth for which hostnames a cert covers. The CN (Common Name) field is legacy and modern browsers ignore it.',
        'Fingerprints in some documentation are uppercase with colons (`AB:CD`), others lowercase without (`abcd`). This tool emits uppercase + colons, matching openssl x509 -fingerprint.',
        'A cert can be technically valid but rejected by your TLS stack for missing extensions (Extended Key Usage, Authority Key Identifier) or for using a deprecated signature (SHA-1 with RSA).',
      ],
      faq: [
        {
          q: 'What is the difference between PEM and DER?',
          a: 'DER is the raw binary encoding (ASN.1 DER). PEM is the base64 of that binary, wrapped in -----BEGIN CERTIFICATE----- / -----END CERTIFICATE-----. Both encode the same data. This tool accepts PEM.',
        },
        {
          q: 'Why does my certificate fail to decode?',
          a: 'Usually one of three reasons: missing BEGIN/END markers, line breaks copied as literal \\n characters, or an actual key file (which starts with BEGIN PRIVATE KEY) pasted instead of a cert. Make sure the input starts with -----BEGIN CERTIFICATE-----.',
        },
        {
          q: 'Is this tool a replacement for `openssl x509 -text`?',
          a: 'For the common fields, yes — and it is friendlier to read. For exotic extensions or pathological cases, fall back to openssl. This tool focuses on the 90% case.',
        },
        {
          q: 'Can I verify the chain of trust?',
          a: 'Not in this tool. Chain validation requires comparing each cert\'s issuer to the next cert\'s subject and verifying signatures with the issuer\'s public key. Use the SSL Check tool against a live host to do that end-to-end.',
        },
        {
          q: 'Does the cert get uploaded anywhere?',
          a: 'No. Parsing and hashing happen in your browser. No network call is made.',
        },
      ],
    },
  },
  {
    slug: 'jwt-generate',
    name: 'JWT Generator',
    description: 'Generate signed JWTs (HS256/384/512) for testing and seeding.',
    category: 'generate',
    keywords: ['jwt', 'generate', 'sign', 'hs256', 'token', 'auth'],
    Component: lazy(() => import('../tools/jwt-generate')),
    seo: {
      title: 'JWT Generator (HS256 / HS384 / HS512) — Sign JSON Web Tokens Online',
      description:
        'Generate a signed JSON Web Token in your browser. HS256, HS384 or HS512 with a shared secret. Add iat, exp, sub and any custom claims. WebCrypto-backed, nothing uploaded.',
    },
    content: {
      about:
        'Builds a real, signed JSON Web Token from a header and payload of your choice using HS256, HS384 or HS512. Signing happens in your browser through WebCrypto — neither the secret nor the payload is sent to any server. Useful for seeding test users, debugging an integration where you need a token with specific claims, or producing a fixture for an automated test.',
      howItWorks: [
        'A JWT is three base64url-encoded parts joined by dots: header.payload.signature. The header declares the algorithm and type ({"alg":"HS256","typ":"JWT"}). The payload is whatever JSON object you want to carry. The signature is HMAC(secret, header + "." + payload), encoded as base64url.',
        'On every change, the tool serializes the header and payload to compact JSON, base64url-encodes each, joins them with a dot, and signs the result with crypto.subtle.sign using your secret as the HMAC key. The signature bytes are base64url-encoded and appended to produce the final token.',
        'Helper buttons let you stamp the standard time-based claims (iat = now, exp = now + 1h / 24h / 7d / 30d) without hand-editing the JSON. The token always re-signs immediately when the payload, secret or algorithm changes.',
      ],
      useCases: [
        'Seeding a test user with a known token so your integration tests do not need to log in.',
        'Debugging an API that rejects "bad token" with no detail — generate a token with the exact claims you expect and compare.',
        'Producing a fixture token with a specific exp for testing token-expiry handling.',
        'Reproducing a customer issue with a token that carries unusual claims (extra scopes, missing aud).',
        'Building a Bearer token for a curl command during development.',
        'Teaching the structure of JWTs without using anyone\'s real signing secret.',
      ],
      examples: [
        {
          title: 'A minimal HS256 token',
          input:
            'Algorithm: HS256\nSecret: your-256-bit-secret\nPayload: {"sub":"1234567890","name":"Jane Doe","iat":1740000000}',
          output:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNzQwMDAwMDAwfQ.4UbpYi5z1QVf2nQX_qoBkZjp4mWv2bMaNXcQSrIfm9o',
          note: 'Three dot-separated segments. The signature is HMAC-SHA256 of the first two segments using the secret, base64url-encoded.',
        },
        {
          title: 'Token with one-hour expiry',
          input: 'Payload: {"sub":"user-42"}\nClick "exp = now + 1h"',
          output:
            'Payload becomes: {"sub":"user-42","iat":1740009600,"exp":1740013200}',
          note: 'The exp claim is a Unix timestamp in seconds. Most libraries reject tokens whose exp is in the past.',
        },
      ],
      gotchas: [
        'Anyone who has the secret can mint valid tokens. Treat the secret like a password — never check it into git, never expose it client-side in production.',
        'HS256 needs a strong secret. RFC 7518 recommends at least 256 bits (32 random bytes). "password123" is technically accepted but trivially brute-forced.',
        'The exp claim is in seconds, not milliseconds. A 13-digit value will be interpreted as a far-future date or rejected by strict libraries.',
        'iat, nbf and exp are checked by the verifier with the verifier\'s clock. A token generated with this tool will be rejected if your server\'s clock is far enough off.',
        'This tool emits HS-family tokens only. For RS256 or ES256 you need an asymmetric key pair, which is more involved than a single secret string. Use jose or your language\'s native library for that.',
        'A generated token still has to be accepted by your verifier — which means the alg, kid, aud, iss and any other claims your server checks must match. The tool only handles the signing math.',
      ],
      faq: [
        {
          q: 'Is my secret sent anywhere?',
          a: 'No. The secret is imported into the browser\'s WebCrypto subsystem locally and used to sign the token in-tab. Nothing — not the secret, not the payload, not the resulting token — is uploaded.',
        },
        {
          q: 'Why HS256 only?',
          a: 'HS256, HS384 and HS512 are the symmetric (shared-secret) JWT algorithms. They need only a string of bytes as the key, which is easy to type into a form. RS256 and ES256 use asymmetric key pairs in PEM format, which is a much heavier UI. We may add RS/ES support later; for now use jose or jsonwebtoken for those.',
        },
        {
          q: 'What is a good HS256 secret?',
          a: 'At least 32 bytes of random data. The API Token Generator on this site emits a 256-bit base64url string in one click — paste that as the secret and you have an RFC-compliant key.',
        },
        {
          q: 'How long should exp be?',
          a: 'For access tokens, 15 minutes to 1 hour is typical. Refresh tokens live days or weeks. For test fixtures, an hour is plenty. There is no upper limit defined in the spec; long-lived tokens are a security risk because revocation is hard.',
        },
        {
          q: 'Can I verify the token I just generated?',
          a: 'Yes — paste it into the JWT Decoder. The decoder shows the header, payload and remaining time on exp. To verify the signature, use your server-side library with the same secret.',
        },
      ],
    },
  },
];

export const toolBySlug: Record<string, Tool> = Object.fromEntries(
  tools.map((t) => [t.slug, t]),
);
