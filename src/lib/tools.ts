import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export type Category =
  | 'encode'
  | 'format'
  | 'inspect'
  | 'generate'
  | 'network'
  | 'convert';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: Category;
  keywords: string[];
  icon?: string;
  Component: LazyExoticComponent<ComponentType>;
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
  },
  {
    slug: 'jwt-decode',
    name: 'JWT Decoder',
    description: 'Inspect header and payload of a JSON Web Token.',
    category: 'inspect',
    keywords: ['jwt', 'token', 'jose', 'auth', 'decode'],
    Component: lazy(() => import('../tools/jwt-decode')),
  },
  {
    slug: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64, Unicode-safe.',
    category: 'encode',
    keywords: ['base64', 'encode', 'decode', 'b64'],
    Component: lazy(() => import('../tools/base64')),
  },
  {
    slug: 'url-encode',
    name: 'URL Encode/Decode',
    description: 'Percent-encode and decode strings for URLs.',
    category: 'encode',
    keywords: ['url', 'percent', 'encode', 'decode', 'uri'],
    Component: lazy(() => import('../tools/url-encode')),
  },
  {
    slug: 'html-encode',
    name: 'HTML Entities',
    description: 'Encode and decode HTML entities.',
    category: 'encode',
    keywords: ['html', 'entities', 'encode', 'decode', 'escape'],
    Component: lazy(() => import('../tools/html-encode')),
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test JavaScript regular expressions live.',
    category: 'inspect',
    keywords: ['regex', 'regexp', 'pattern', 'match'],
    Component: lazy(() => import('../tools/regex-tester')),
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate v4 UUIDs in bulk.',
    category: 'generate',
    keywords: ['uuid', 'guid', 'random', 'id'],
    Component: lazy(() => import('../tools/uuid-generator')),
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'SHA-1, SHA-256, SHA-384, SHA-512 of any input.',
    category: 'generate',
    keywords: ['hash', 'sha', 'sha256', 'digest', 'crypto'],
    Component: lazy(() => import('../tools/hash-generator')),
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB and HSL.',
    category: 'convert',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'css'],
    Component: lazy(() => import('../tools/color-converter')),
  },
  {
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Unix epoch ↔ human-readable date.',
    category: 'convert',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'iso'],
    Component: lazy(() => import('../tools/timestamp-converter')),
  },
  {
    slug: 'cron-parser',
    name: 'Cron Explainer',
    description: 'Translate cron expressions into plain English.',
    category: 'inspect',
    keywords: ['cron', 'schedule', 'crontab'],
    Component: lazy(() => import('../tools/cron-parser')),
  },
  {
    slug: 'json-to-ts',
    name: 'JSON → TypeScript',
    description: 'Infer TypeScript interfaces from a JSON sample.',
    category: 'convert',
    keywords: ['json', 'typescript', 'interface', 'types'],
    Component: lazy(() => import('../tools/json-to-ts')),
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text by words or paragraphs.',
    category: 'generate',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
    Component: lazy(() => import('../tools/lorem-ipsum')),
  },
  {
    slug: 'diff-viewer',
    name: 'Diff Viewer',
    description: 'Side-by-side line diff between two snippets.',
    category: 'inspect',
    keywords: ['diff', 'compare', 'text'],
    Component: lazy(() => import('../tools/diff-viewer')),
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Live preview a small Markdown subset.',
    category: 'format',
    keywords: ['markdown', 'md', 'preview'],
    Component: lazy(() => import('../tools/markdown-preview')),
  },
  {
    slug: 'url-parser',
    name: 'URL Parser',
    description: 'Break a URL into protocol, host, path, query, hash.',
    category: 'inspect',
    keywords: ['url', 'parse', 'query', 'host'],
    Component: lazy(() => import('../tools/url-parser')),
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    description: 'camelCase, snake_case, kebab-case, CONSTANT and more.',
    category: 'convert',
    keywords: ['case', 'camel', 'snake', 'kebab', 'pascal'],
    Component: lazy(() => import('../tools/case-converter')),
  },
  {
    slug: 'string-inspector',
    name: 'String Inspector',
    description: 'Length, byte size, line/word counts, codepoints.',
    category: 'inspect',
    keywords: ['string', 'count', 'length', 'bytes'],
    Component: lazy(() => import('../tools/string-inspector')),
  },
  {
    slug: 'number-base',
    name: 'Number Base',
    description: 'Convert between binary, octal, decimal and hex.',
    category: 'convert',
    keywords: ['binary', 'hex', 'octal', 'decimal', 'base'],
    Component: lazy(() => import('../tools/number-base')),
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Resolve A, AAAA, MX, TXT, NS records.',
    category: 'network',
    keywords: ['dns', 'lookup', 'resolve', 'mx', 'txt'],
    Component: lazy(() => import('../tools/dns-lookup')),
  },
  {
    slug: 'ssl-check',
    name: 'SSL Check',
    description: 'Inspect a host’s TLS certificate chain and expiry.',
    category: 'network',
    keywords: ['ssl', 'tls', 'certificate', 'cert', 'expiry'],
    Component: lazy(() => import('../tools/ssl-check')),
  },
  {
    slug: 'user-agent-parser',
    name: 'User-Agent Parser',
    description: 'Identify browser, OS and device from a UA string.',
    category: 'inspect',
    keywords: ['user-agent', 'ua', 'browser', 'os'],
    Component: lazy(() => import('../tools/user-agent-parser')),
  },
  {
    slug: 'http-status',
    name: 'HTTP Status Codes',
    description: 'Search and explain HTTP status codes.',
    category: 'inspect',
    keywords: ['http', 'status', 'code', 'rfc'],
    Component: lazy(() => import('../tools/http-status')),
  },
];

export const toolBySlug: Record<string, Tool> = Object.fromEntries(
  tools.map((t) => [t.slug, t]),
);
