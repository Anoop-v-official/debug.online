import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookmarkPlus,
  Command,
  Flame,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { useSeo } from '../lib/seo';
import { toolBySlug } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';
import { sniff, type SniffResult } from '../lib/sniff';
import { setSmartPaste } from '../lib/smartPaste';

type RoleCategory = 'backend' | 'frontend' | 'devops' | 'sysadmin' | 'security';
type Filter = 'all' | 'trending' | 'new' | 'favorites';

interface MarketingTool {
  id: string;
  name: string;
  description: string;
  category: RoleCategory;
  icon: string;
  badge: string;
  searchVolume: string;
  searchVolumeNum: number;
  tags: string[];
  existingSlug?: string;
  isNew?: boolean;
}

const ROLE_META: Record<
  RoleCategory,
  { label: string; color: string; bg: string; dot: string; emoji: string }
> = {
  backend: {
    label: 'Backend',
    color: 'text-role-backend',
    bg: 'bg-role-backend/10',
    dot: 'bg-role-backend',
    emoji: '🔵',
  },
  frontend: {
    label: 'Frontend',
    color: 'text-role-frontend',
    bg: 'bg-role-frontend/10',
    dot: 'bg-role-frontend',
    emoji: '🟡',
  },
  devops: {
    label: 'DevOps & SRE',
    color: 'text-role-devops',
    bg: 'bg-role-devops/10',
    dot: 'bg-role-devops',
    emoji: '🔴',
  },
  sysadmin: {
    label: 'SysAdmin',
    color: 'text-role-sysadmin',
    bg: 'bg-role-sysadmin/10',
    dot: 'bg-role-sysadmin',
    emoji: '🟢',
  },
  security: {
    label: 'Security',
    color: 'text-role-security',
    bg: 'bg-role-security/10',
    dot: 'bg-role-security',
    emoji: '🟣',
  },
};

const CATEGORY_ORDER: RoleCategory[] = [
  'backend',
  'frontend',
  'devops',
  'sysadmin',
  'security',
];

const TOOLS: MarketingTool[] = [
  // Backend
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, validate, minify and compare JSON instantly.',
    category: 'backend',
    icon: '{ }',
    badge: '🔥 Most Searched',
    searchVolume: '2.1M/mo',
    searchVolumeNum: 2_100_000,
    tags: ['json', 'format', 'validate', 'minify', 'beautify'],
    existingSlug: 'json-format',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode JWT tokens. See header, payload, expiry countdown.',
    category: 'backend',
    icon: '🔑',
    badge: '🔥 Most Searched',
    searchVolume: '890K/mo',
    searchVolumeNum: 890_000,
    tags: ['jwt', 'token', 'decode', 'auth', 'bearer'],
    existingSlug: 'jwt-decode',
  },
  {
    id: 'api-tester',
    name: 'API Request Tester',
    description: 'GET/POST/PUT/DELETE in browser. Postman alternative.',
    category: 'backend',
    icon: '⚡',
    badge: '✨ New',
    searchVolume: '540K/mo',
    searchVolumeNum: 540_000,
    tags: ['api', 'rest', 'postman', 'http', 'request'],
    isNew: true,
    existingSlug: 'api-tester',
  },
  {
    id: 'cron-builder',
    name: 'Cron Expression Explainer',
    description: 'Translate cron expressions to plain English.',
    category: 'backend',
    icon: '⏰',
    badge: '🔥 Most Searched',
    searchVolume: '720K/mo',
    searchVolumeNum: 720_000,
    tags: ['cron', 'schedule', 'expression', 'unix'],
    existingSlug: 'cron-parser',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Live regex matching with capture groups and offsets.',
    category: 'backend',
    icon: '.*',
    badge: '🔥 Most Searched',
    searchVolume: '1.2M/mo',
    searchVolumeNum: 1_200_000,
    tags: ['regex', 'regexp', 'pattern', 'match', 'test'],
    existingSlug: 'regex-tester',
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format messy SQL across MySQL, Postgres, MSSQL and more.',
    category: 'backend',
    icon: '🗃️',
    badge: '',
    searchVolume: '430K/mo',
    searchVolumeNum: 430_000,
    tags: ['sql', 'format', 'mysql', 'postgres', 'query'],
    existingSlug: 'sql-formatter',
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode or decode Base64, UTF-8 safe.',
    category: 'backend',
    icon: '64',
    badge: '🔥 Most Searched',
    searchVolume: '1.8M/mo',
    searchVolumeNum: 1_800_000,
    tags: ['base64', 'encode', 'decode', 'binary'],
    existingSlug: 'base64',
  },
  {
    id: 'unix-timestamp',
    name: 'Unix Timestamp Converter',
    description: 'Unix epoch ↔ human dates, timezone-aware.',
    category: 'backend',
    icon: '📅',
    badge: '🔥 Most Searched',
    searchVolume: '950K/mo',
    searchVolumeNum: 950_000,
    tags: ['unix', 'timestamp', 'epoch', 'date', 'time'],
    existingSlug: 'timestamp-converter',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate v4 UUIDs in bulk, copy all in one click.',
    category: 'backend',
    icon: '🆔',
    badge: '',
    searchVolume: '380K/mo',
    searchVolumeNum: 380_000,
    tags: ['uuid', 'guid', 'random', 'unique'],
    existingSlug: 'uuid-generator',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'SHA-1, SHA-256, SHA-384, SHA-512 of any text.',
    category: 'backend',
    icon: '#',
    badge: '',
    searchVolume: '290K/mo',
    searchVolumeNum: 290_000,
    tags: ['hash', 'sha', 'sha256', 'crypto'],
    existingSlug: 'hash-generator',
  },
  {
    id: 'http-status',
    name: 'HTTP Status Codes',
    description: 'Every HTTP status code, searchable, in plain English.',
    category: 'backend',
    icon: '200',
    badge: '🔥 Most Searched',
    searchVolume: '670K/mo',
    searchVolumeNum: 670_000,
    tags: ['http', 'status', '404', '500', 'error'],
    existingSlug: 'http-status',
  },
  {
    id: 'bcrypt-tester',
    name: 'Bcrypt Hash Tester',
    description: 'Generate or verify bcrypt password hashes.',
    category: 'backend',
    icon: '🔒',
    badge: '',
    searchVolume: '180K/mo',
    searchVolumeNum: 180_000,
    tags: ['bcrypt', 'hash', 'password', 'verify', 'salt'],
    existingSlug: 'bcrypt-tester',
  },

  // Frontend
  {
    id: 'css-unit-converter',
    name: 'CSS Unit Converter',
    description: 'px ↔ rem ↔ em ↔ vh ↔ vw ↔ %. Configurable base.',
    category: 'frontend',
    icon: 'px',
    badge: '🔥 Most Searched',
    searchVolume: '520K/mo',
    searchVolumeNum: 520_000,
    tags: ['css', 'px', 'rem', 'em', 'unit'],
    existingSlug: 'css-unit-converter',
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'HEX ↔ RGB ↔ HSL with live swatch.',
    category: 'frontend',
    icon: '🎨',
    badge: '🔥 Most Searched',
    searchVolume: '780K/mo',
    searchVolumeNum: 780_000,
    tags: ['color', 'hex', 'rgb', 'hsl', 'css'],
    existingSlug: 'color-converter',
  },
  {
    id: 'gradient-generator',
    name: 'CSS Gradient Generator',
    description: 'Linear, radial, conic gradients with live preview.',
    category: 'frontend',
    icon: '🌈',
    badge: '',
    searchVolume: '340K/mo',
    searchVolumeNum: 340_000,
    tags: ['gradient', 'css', 'background'],
    existingSlug: 'gradient-generator',
  },
  {
    id: 'shadow-generator',
    name: 'Box & Text Shadow',
    description: 'Multi-layer box-shadow and text-shadow generator.',
    category: 'frontend',
    icon: '🔳',
    badge: '',
    searchVolume: '220K/mo',
    searchVolumeNum: 220_000,
    tags: ['shadow', 'box-shadow', 'css'],
    existingSlug: 'shadow-generator',
  },
  {
    id: 'meta-preview',
    name: 'Meta Tag & OG Preview',
    description: 'Preview Google, Twitter, Facebook & LinkedIn cards.',
    category: 'frontend',
    icon: '🔗',
    badge: '✨ New',
    searchVolume: '190K/mo',
    searchVolumeNum: 190_000,
    tags: ['meta', 'og', 'seo', 'opengraph', 'preview'],
    isNew: true,
    existingSlug: 'meta-preview',
  },
  {
    id: 'contrast-checker',
    name: 'Contrast Checker',
    description: 'WCAG 2.1 AA/AAA contrast ratio checker.',
    category: 'frontend',
    icon: '♿',
    badge: '',
    searchVolume: '160K/mo',
    searchVolumeNum: 160_000,
    tags: ['contrast', 'wcag', 'accessibility', 'a11y'],
    existingSlug: 'contrast-checker',
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer',
    description: 'Strip metadata, comments and editor cruft from SVG.',
    category: 'frontend',
    icon: '⭐',
    badge: '',
    searchVolume: '140K/mo',
    searchVolumeNum: 140_000,
    tags: ['svg', 'optimize', 'minify', 'compress'],
    existingSlug: 'svg-optimizer',
  },
  {
    id: 'responsive-tester',
    name: 'Responsive Design Tester',
    description: 'Test any URL across 10 device sizes side-by-side.',
    category: 'frontend',
    icon: '📱',
    badge: '🔥 Most Searched',
    searchVolume: '410K/mo',
    searchVolumeNum: 410_000,
    tags: ['responsive', 'mobile', 'device', 'breakpoint'],
    existingSlug: 'responsive-tester',
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    description: 'Drop an image, get a Base64 data URL ready for HTML/CSS.',
    category: 'frontend',
    icon: '🖼️',
    badge: '',
    searchVolume: '280K/mo',
    searchVolumeNum: 280_000,
    tags: ['image', 'base64', 'data-url', 'embed'],
    existingSlug: 'image-to-base64',
  },

  // DevOps
  {
    id: 'yaml-validator',
    name: 'YAML Validator',
    description: 'Validate YAML; round-trip to JSON. K8s manifest ready.',
    category: 'devops',
    icon: '📋',
    badge: '🔥 Most Searched',
    searchVolume: '380K/mo',
    searchVolumeNum: 380_000,
    tags: ['yaml', 'validate', 'kubernetes', 'k8s'],
    existingSlug: 'yaml-validator',
  },
  {
    id: 'dockerfile-linter',
    name: 'Dockerfile Linter',
    description: 'Spot anti-patterns in your Dockerfile, Hadolint-style.',
    category: 'devops',
    icon: '🐳',
    badge: '✨ New',
    searchVolume: '210K/mo',
    searchVolumeNum: 210_000,
    tags: ['dockerfile', 'docker', 'lint', 'image'],
    isNew: true,
    existingSlug: 'dockerfile-linter',
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description: 'Inspect TLS cert: subject, issuer, expiry, SAN.',
    category: 'devops',
    icon: '🛡️',
    badge: '🔥 Most Searched',
    searchVolume: '560K/mo',
    searchVolumeNum: 560_000,
    tags: ['ssl', 'tls', 'certificate', 'https', 'expiry'],
    existingSlug: 'ssl-check',
  },
  {
    id: 'nginx-generator',
    name: 'Nginx Config Generator',
    description: 'Production-ready Nginx config from a few questions.',
    category: 'devops',
    icon: '⚙️',
    badge: '✨ New',
    searchVolume: '320K/mo',
    searchVolumeNum: 320_000,
    tags: ['nginx', 'config', 'reverse-proxy', 'ssl'],
    isNew: true,
    existingSlug: 'nginx-generator',
  },
  {
    id: 'cidr-calculator',
    name: 'CIDR / Subnet Calculator',
    description: 'Network, broadcast, mask, usable hosts for any CIDR.',
    category: 'devops',
    icon: '🌐',
    badge: '',
    searchVolume: '240K/mo',
    searchVolumeNum: 240_000,
    tags: ['cidr', 'subnet', 'ip', 'network', 'vpc'],
    existingSlug: 'cidr-calculator',
  },
  {
    id: 'env-diff',
    name: '.ENV File Diff',
    description: 'Compare two .env files: missing, changed, identical.',
    category: 'devops',
    icon: '🔄',
    badge: '✨ New',
    searchVolume: '95K/mo',
    searchVolumeNum: 95_000,
    tags: ['env', 'environment', 'diff', 'dotenv'],
    isNew: true,
    existingSlug: 'env-diff',
  },
  {
    id: 'http-headers',
    name: 'HTTP Headers Inspector',
    description: 'Response headers + a security score for any URL.',
    category: 'devops',
    icon: '🔍',
    badge: '',
    searchVolume: '175K/mo',
    searchVolumeNum: 175_000,
    tags: ['headers', 'http', 'cors', 'security'],
    existingSlug: 'http-headers',
  },

  // SysAdmin
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Geolocation, ISP, ASN, VPN/proxy detection.',
    category: 'sysadmin',
    icon: '📡',
    badge: '🔥 #1 Most Searched',
    searchVolume: '3.6M/mo',
    searchVolumeNum: 3_600_000,
    tags: ['ip', 'geolocation', 'isp', 'asn', 'vpn'],
    existingSlug: 'ip-lookup',
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'A, AAAA, MX, TXT, NS records via Cloudflare/Google.',
    category: 'sysadmin',
    icon: '🔎',
    badge: '🔥 Most Searched',
    searchVolume: '820K/mo',
    searchVolumeNum: 820_000,
    tags: ['dns', 'lookup', 'mx', 'cname', 'nameserver'],
    existingSlug: 'dns-lookup',
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Domain registrar, creation, expiry, nameservers.',
    category: 'sysadmin',
    icon: '📂',
    badge: '🔥 Most Searched',
    searchVolume: '640K/mo',
    searchVolumeNum: 640_000,
    tags: ['whois', 'domain', 'registrar', 'expiry'],
    existingSlug: 'whois',
  },
  {
    id: 'ping-test',
    name: 'Ping Test',
    description: 'TCP-connect timing to any host:port from our server.',
    category: 'sysadmin',
    icon: '📶',
    badge: '',
    searchVolume: '390K/mo',
    searchVolumeNum: 390_000,
    tags: ['ping', 'latency', 'tcp', 'rtt'],
    existingSlug: 'ping-test',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Strong passwords or passphrases, 100% client-side.',
    category: 'sysadmin',
    icon: '🔐',
    badge: '🔥 Most Searched',
    searchVolume: '1.1M/mo',
    searchVolumeNum: 1_100_000,
    tags: ['password', 'generate', 'strong', 'random'],
    existingSlug: 'password-generator',
  },
  {
    id: 'ssh-keygen',
    name: 'SSH Key Generator',
    description: 'RSA SSH key pair via WebCrypto. Zero server contact.',
    category: 'sysadmin',
    icon: '🗝️',
    badge: '',
    searchVolume: '180K/mo',
    searchVolumeNum: 180_000,
    tags: ['ssh', 'keygen', 'rsa', 'pem'],
    existingSlug: 'ssh-keygen',
  },
  {
    id: 'uptime-checker',
    name: 'Uptime Checker',
    description: 'Is the site up? Status, redirect chain, total time.',
    category: 'sysadmin',
    icon: '✅',
    badge: '🔥 Most Searched',
    searchVolume: '870K/mo',
    searchVolumeNum: 870_000,
    tags: ['uptime', 'down', 'website', 'monitor'],
    existingSlug: 'uptime-checker',
  },

  // Security
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Percent-encode and decode URLs and query strings.',
    category: 'security',
    icon: '🔗',
    badge: '🔥 Most Searched',
    searchVolume: '760K/mo',
    searchVolumeNum: 760_000,
    tags: ['url', 'encode', 'decode', 'percent'],
    existingSlug: 'url-encode',
  },
  {
    id: 'ip-blacklist',
    name: 'IP Blacklist Checker',
    description: 'Check 12 DNSBLs in parallel for any IPv4 address.',
    category: 'security',
    icon: '🚫',
    badge: '',
    searchVolume: '210K/mo',
    searchVolumeNum: 210_000,
    tags: ['blacklist', 'ip', 'spam', 'dnsbl'],
    existingSlug: 'ip-blacklist',
  },
  {
    id: 'fake-data-generator',
    name: 'Test Data Generator',
    description: 'Names, emails, addresses, IPs in JSON or CSV.',
    category: 'security',
    icon: '🎭',
    badge: '✨ New',
    searchVolume: '290K/mo',
    searchVolumeNum: 290_000,
    tags: ['fake', 'test', 'data', 'mock'],
    isNew: true,
    existingSlug: 'fake-data-generator',
  },
  {
    id: 'csp-generator',
    name: 'CSP Header Generator',
    description: 'Build a Content Security Policy directive by directive.',
    category: 'security',
    icon: '🛡️',
    badge: '',
    searchVolume: '95K/mo',
    searchVolumeNum: 95_000,
    tags: ['csp', 'content-security-policy', 'header', 'xss'],
    existingSlug: 'csp-generator',
  },
  {
    id: 'email-header-analyzer',
    name: 'Email Header Analyzer',
    description: 'SPF, DKIM, DMARC plus full Received hop chain.',
    category: 'security',
    icon: '📧',
    badge: '✨ New',
    searchVolume: '145K/mo',
    searchVolumeNum: 145_000,
    tags: ['email', 'header', 'spf', 'dkim', 'dmarc'],
    isNew: true,
    existingSlug: 'email-header-analyzer',
  },

  // Recently added — high search volume client-side tools
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for any URL or text. PNG and SVG download.',
    category: 'frontend',
    icon: '▦',
    badge: '🔥 Most Searched',
    searchVolume: '1.2M/mo',
    searchVolumeNum: 1_200_000,
    tags: ['qr', 'qrcode', 'barcode', 'png', 'svg'],
    isNew: true,
    existingSlug: 'qr-code-generator',
  },
  {
    id: 'random-number',
    name: 'Random Number Generator',
    description: 'Cryptographically random integers, range and count of your choice.',
    category: 'sysadmin',
    icon: '⚂',
    badge: '🔥 Most Searched',
    searchVolume: '890K/mo',
    searchVolumeNum: 890_000,
    tags: ['random', 'number', 'rng', 'lottery'],
    isNew: true,
    existingSlug: 'random-number',
  },
  {
    id: 'timezone-converter',
    name: 'Time Zone Converter',
    description: 'Convert any moment to multiple time zones at once.',
    category: 'backend',
    icon: '🕒',
    badge: '🔥 Most Searched',
    searchVolume: '470K/mo',
    searchVolumeNum: 470_000,
    tags: ['timezone', 'tz', 'utc', 'world clock'],
    isNew: true,
    existingSlug: 'timezone-converter',
  },
  {
    id: 'markdown-table',
    name: 'Markdown Table Generator',
    description: 'Build markdown tables in a grid. CSV import, GFM output.',
    category: 'frontend',
    icon: '⊞',
    badge: '',
    searchVolume: '340K/mo',
    searchVolumeNum: 340_000,
    tags: ['markdown', 'table', 'csv', 'github'],
    isNew: true,
    existingSlug: 'markdown-table',
  },
  {
    id: 'date-diff',
    name: 'Date Diff Calculator',
    description: 'Difference between two dates in years, days, hours, working days.',
    category: 'backend',
    icon: '📆',
    badge: '',
    searchVolume: '240K/mo',
    searchVolumeNum: 240_000,
    tags: ['date', 'diff', 'duration', 'working days'],
    isNew: true,
    existingSlug: 'date-diff',
  },
  {
    id: 'curl-builder',
    name: 'cURL Command Builder',
    description: 'Build a cURL command from method, URL, headers and body.',
    category: 'backend',
    icon: '⌘',
    badge: '',
    searchVolume: '210K/mo',
    searchVolumeNum: 210_000,
    tags: ['curl', 'command', 'http', 'cli'],
    isNew: true,
    existingSlug: 'curl-builder',
  },
  {
    id: 'json-path',
    name: 'JSONPath Tester',
    description: 'Query JSON live with JSONPath: $, .field, [n], [*], ..',
    category: 'backend',
    icon: '$',
    badge: '',
    searchVolume: '180K/mo',
    searchVolumeNum: 180_000,
    tags: ['jsonpath', 'jq', 'query', 'json'],
    isNew: true,
    existingSlug: 'json-path',
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'URL-safe slugs from titles. Strips accents and stop-words.',
    category: 'frontend',
    icon: '/',
    badge: '',
    searchVolume: '120K/mo',
    searchVolumeNum: 120_000,
    tags: ['slug', 'url', 'permalink', 'seo'],
    isNew: true,
    existingSlug: 'slug-generator',
  },
];

const TYPING_LINES = [
  'Format JSON',
  'Decode JWT',
  'Check SSL expiry',
  'Resolve DNS',
  'Hash input',
  'Build cron expression',
  'Validate YAML',
  'Test regex',
];

function fuzzyScore(needle: string, haystack: string): number {
  if (!needle) return 0;
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (h.includes(n)) return 1000 - h.indexOf(n);
  let i = 0;
  let score = 0;
  for (const ch of h) {
    if (ch === n[i]) {
      score += 5;
      i++;
      if (i === n.length) break;
    }
  }
  return i === n.length ? score : 0;
}

function useTypingCycle(lines: string[], { typeMs = 70, holdMs = 1100 } = {}) {
  const [text, setText] = useState('');
  useEffect(() => {
    let i = 0;
    let charIdx = 0;
    let mode: 'type' | 'hold' | 'erase' = 'type';
    let timer: number;
    function step() {
      const current = lines[i % lines.length];
      if (mode === 'type') {
        charIdx++;
        setText(current.slice(0, charIdx));
        if (charIdx >= current.length) {
          mode = 'hold';
          timer = window.setTimeout(step, holdMs);
          return;
        }
        timer = window.setTimeout(step, typeMs);
      } else if (mode === 'hold') {
        mode = 'erase';
        timer = window.setTimeout(step, 200);
      } else {
        charIdx = Math.max(0, charIdx - 2);
        setText(current.slice(0, charIdx));
        if (charIdx === 0) {
          i++;
          mode = 'type';
        }
        timer = window.setTimeout(step, 35);
      }
    }
    timer = window.setTimeout(step, 600);
    return () => window.clearTimeout(timer);
  }, [lines, typeMs, holdMs]);
  return text;
}

interface HomeProps {
  onOpenPalette: () => void;
}

export function Home({ onOpenPalette }: HomeProps) {
  useSeo({
    title:
      'Free Developer Tools Online | debugdaily — JSON Formatter, JWT Decoder, IP Lookup & 50+ More',
    description:
      'debugdaily.online is the free online toolkit for developers, DevOps engineers & sysadmins. JSON formatter, JWT decoder, cron builder, SSL checker, IP lookup and 50+ tools. No login. No install. Always free.',
    path: '/',
  });

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [focusIdx, setFocusIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const favoriteSlugs = useFavoritesStore((s) => s.slugs);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  const typing = useTypingCycle(TYPING_LINES);

  // Slash key focuses the search; ⌘K is handled by App for the palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (e.key === '/' && !inField) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo<MarketingTool[]>(() => {
    let pool = TOOLS;
    if (filter === 'trending') {
      pool = [...TOOLS].sort((a, b) => b.searchVolumeNum - a.searchVolumeNum);
    } else if (filter === 'new') {
      pool = TOOLS.filter((t) => t.isNew);
    } else if (filter === 'favorites') {
      const set = new Set(favoriteSlugs);
      pool = TOOLS.filter((t) => t.existingSlug && set.has(t.existingSlug));
    }
    if (!query.trim()) return pool;
    const q = query.trim();
    return pool
      .map((t) => {
        const hay = [t.name, t.description, ...t.tags, t.id].join(' ');
        return { t, score: fuzzyScore(q, hay) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.t);
  }, [filter, query, favoriteSlugs]);

  // Group by category when no search/filter is narrowing
  const grouped = useMemo(() => {
    if (filter !== 'all' || query.trim()) {
      return null;
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      tools: filtered.filter((t) => t.category === cat),
    })).filter((g) => g.tools.length > 0);
  }, [filtered, filter, query]);

  useEffect(() => {
    setFocusIdx(0);
  }, [filter, query]);

  // Smart paste: detect when the search input contains a recognizable
  // payload (JWT, JSON, color, timestamp, URL, IP, domain, UUID) and route
  // it directly to the matching tool with the value pre-filled.
  const smartMatch: SniffResult | null = useMemo(() => {
    if (!query.trim()) return null;
    const result = sniff(query);
    if (!result) return null;
    if (!toolBySlug[result.slug]) return null;
    return result;
  }, [query]);

  function openSmart(match: SniffResult) {
    setSmartPaste(match.slug, match.value);
    navigate(`/tools/${match.slug}`);
  }

  function openTool(tool: MarketingTool) {
    if (tool.existingSlug && toolBySlug[tool.existingSlug]) {
      navigate(`/tools/${tool.existingSlug}`);
    }
  }

  function onSearchKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      // Smart paste wins over fuzzy match.
      if (smartMatch) {
        e.preventDefault();
        openSmart(smartMatch);
        return;
      }
      const t = filtered[focusIdx];
      if (t) openTool(t);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  }

  return (
    <div className="-mx-4 sm:-mx-6 -mt-6 sm:-mt-8 relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-scanlines opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid-fade"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <Hero
          searchInputRef={searchInputRef}
          query={query}
          setQuery={setQuery}
          onSearchKey={onSearchKey}
          typing={typing}
          openPalette={onOpenPalette}
        />

        {smartMatch ? (
          <SmartPasteBanner match={smartMatch} onOpen={() => openSmart(smartMatch)} />
        ) : null}

        <FilterChips active={filter} setActive={setFilter} />

        {grouped ? (
          <div className="space-y-12 pb-12">
            {grouped.map((g) => (
              <CategorySection
                key={g.category}
                category={g.category}
                tools={g.tools}
                onOpen={openTool}
                favoriteSlugs={favoriteSlugs}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <FlatGrid
            tools={filtered}
            focusIdx={focusIdx}
            favoriteSlugs={favoriteSlugs}
            onToggleFavorite={toggleFavorite}
            onOpen={openTool}
            query={query}
            filter={filter}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

interface HeroProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  query: string;
  setQuery: (s: string) => void;
  onSearchKey: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  typing: string;
  openPalette: () => void;
}

function Hero({ searchInputRef, query, setQuery, onSearchKey, typing, openPalette }: HeroProps) {
  return (
    <section className="pt-8 sm:pt-12 pb-6 space-y-5">
      <div className="inline-flex items-center gap-2 chip border-accent/40 text-accent bg-accent/5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
        {TOOLS.length} tools · 100% free · No login
      </div>

      <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
        Every tool a developer{' '}
        <span className="text-accent">actually needs</span>. Daily.
      </h1>

      <p className="text-muted text-sm sm:text-base max-w-2xl leading-relaxed">
        A free online toolbox for backend, frontend, DevOps, sysadmin and security work.
        <span className="hidden sm:inline">
          {' '}
          Faster than your bookmarks bar, cleaner than the alternatives.
        </span>
      </p>

      {/* Big search bar */}
      <div className="relative max-w-3xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle pointer-events-none"
          aria-hidden
        />
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
          placeholder={`Search ${TOOLS.length}+ tools — try "${typing}"`}
          aria-label="Search developer tools"
          className="w-full pl-12 pr-28 py-4 rounded-xl bg-surface border border-border-strong text-text placeholder:text-subtle focus:outline-none focus:border-accent focus:shadow-glow transition-all text-base font-mono"
        />
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-surface-2 hover:border-accent hover:text-accent transition-colors text-xs"
        >
          <Command className="w-3.5 h-3.5" aria-hidden />
          <span className="font-mono">K</span>
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────  FILTER CHIPS  ───────────────────────────── */

/* ─────────────────────────────  SMART PASTE BANNER  ───────────────────────────── */

function SmartPasteBanner({
  match,
  onOpen,
}: {
  match: SniffResult;
  onOpen: () => void;
}) {
  const tool = toolBySlug[match.slug];
  if (!tool) return null;
  const article = /^[aeiou]/i.test(match.label) ? 'an' : 'a';
  const preview =
    match.value.length > 80 ? match.value.slice(0, 80) + '…' : match.value;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open in ${tool.name}`}
      className="group w-full text-left mb-6 rounded-xl border border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors p-4 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden
          className="text-accent text-2xl font-mono leading-none shrink-0"
        >
          ↳
        </span>
        <div className="min-w-0">
          <div className="text-sm text-text">
            Looks like {article}{' '}
            <span className="text-accent font-medium">{match.label}</span>. Open in{' '}
            <span className="font-mono">{tool.name}</span>?
          </div>
          <div className="text-2xs text-subtle font-mono mt-0.5 truncate">
            {preview}
          </div>
        </div>
      </div>
      <span className="hidden sm:flex items-center gap-2 text-xs font-mono text-accent shrink-0">
        Open
        <span className="kbd">↵</span>
      </span>
    </button>
  );
}

const FILTER_META: Record<Filter, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All Tools', icon: <span aria-hidden>◇</span> },
  trending: { label: 'Most Searched', icon: <Flame className="w-3.5 h-3.5" aria-hidden /> },
  new: { label: 'New', icon: <Sparkles className="w-3.5 h-3.5" aria-hidden /> },
  favorites: { label: 'Favorites', icon: <Star className="w-3.5 h-3.5" aria-hidden /> },
};

function FilterChips({ active, setActive }: { active: Filter; setActive: (f: Filter) => void }) {
  return (
    <nav
      role="tablist"
      aria-label="Filter tools"
      className="flex flex-wrap items-center gap-1.5 mb-8"
    >
      {(Object.keys(FILTER_META) as Filter[]).map((f) => {
        const isActive = active === f;
        return (
          <button
            key={f}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(f)}
            className={
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
              (isActive
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-surface border-border text-muted hover:text-text hover:border-border-strong')
            }
          >
            {FILTER_META[f].icon}
            <span>{FILTER_META[f].label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────  CATEGORY SECTION  ───────────────────────────── */

interface SectionProps {
  category: RoleCategory;
  tools: MarketingTool[];
  onOpen: (t: MarketingTool) => void;
  favoriteSlugs: string[];
  onToggleFavorite: (slug: string) => void;
}

function CategorySection({ category, tools, onOpen, favoriteSlugs, onToggleFavorite }: SectionProps) {
  const meta = ROLE_META[category];
  return (
    <section id={category} className="scroll-mt-20 space-y-4">
      <header className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
        <h2 className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-semibold tracking-tight">
          <span aria-hidden className={`w-2 h-2 rounded-full ${meta.dot}`} />
          <span className={meta.color}>{meta.label}</span>
        </h2>
        <span className="text-2xs uppercase tracking-wider font-mono text-subtle">
          {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
        </span>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {tools.map((tool, i) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            focused={false}
            isFavorite={!!tool.existingSlug && favoriteSlugs.includes(tool.existingSlug)}
            onToggleFavorite={onToggleFavorite}
            onOpen={onOpen}
            stagger={i}
          />
        ))}
      </ul>
    </section>
  );
}

/* ─────────────────────────────  FLAT GRID (search/filter view)  ───────────────────────────── */

interface FlatGridProps {
  tools: MarketingTool[];
  focusIdx: number;
  favoriteSlugs: string[];
  onToggleFavorite: (slug: string) => void;
  onOpen: (t: MarketingTool) => void;
  query: string;
  filter: Filter;
}

function FlatGrid({ tools, focusIdx, favoriteSlugs, onToggleFavorite, onOpen, query, filter }: FlatGridProps) {
  if (tools.length === 0) {
    return (
      <div className="card p-10 text-center space-y-2 mb-12">
        <div className="text-2xl">¯\_(ツ)_/¯</div>
        <p className="text-muted text-sm">
          {filter === 'favorites' ? (
            <>
              No favorites yet. Bookmark tools with the <Star className="inline w-3.5 h-3.5 -mt-0.5" /> icon.
            </>
          ) : query ? (
            <>No tools match "{query}".</>
          ) : (
            <>Nothing here yet.</>
          )}
        </p>
      </div>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-12" role="list">
      {tools.map((tool, i) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          focused={i === focusIdx}
          isFavorite={!!tool.existingSlug && favoriteSlugs.includes(tool.existingSlug)}
          onToggleFavorite={onToggleFavorite}
          onOpen={onOpen}
          stagger={i}
        />
      ))}
    </ul>
  );
}

/* ─────────────────────────────  TOOL CARD  ───────────────────────────── */

interface CardProps {
  tool: MarketingTool;
  focused: boolean;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  onOpen: (t: MarketingTool) => void;
  stagger: number;
}

function ToolCard({ tool, focused, isFavorite, onToggleFavorite, onOpen, stagger }: CardProps) {
  const meta = ROLE_META[tool.category];
  return (
    <li
      data-keywords={tool.tags.join(',')}
      data-category={tool.category}
      style={{
        animationDelay: `${Math.min(stagger * 25, 240)}ms`,
        animationFillMode: 'both',
      }}
      className="animate-slide-up"
    >
      <article
        onClick={() => onOpen(tool)}
        onKeyDown={(e) => (e.key === 'Enter' ? onOpen(tool) : undefined)}
        tabIndex={0}
        role="button"
        aria-label={`Open ${tool.name}`}
        className={`group relative card p-4 cursor-pointer transition-all duration-150
                    hover:border-border-strong hover:bg-surface-2 hover:-translate-y-0.5
                    ${focused ? 'ring-2 ring-accent/40' : ''}`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md font-mono text-sm font-semibold border border-border ${meta.bg} ${meta.color}`}
          >
            {tool.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-mono font-semibold text-text leading-tight pr-6">
                {tool.name}
              </h3>
              {tool.isNew ? (
                <span
                  className="chip text-cyan border-cyan/30 bg-cyan/10 shrink-0"
                  title="Recently added"
                >
                  New
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted leading-relaxed mt-1">{tool.description}</p>
          </div>
        </div>

        {/* Bottom row: search volume + favorite + arrow */}
        <div className="flex items-center justify-between mt-3 text-2xs font-mono">
          <span className="text-subtle">{tool.searchVolume}</span>
          <div className="flex items-center gap-2">
            {tool.existingSlug ? (
              <button
                type="button"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={isFavorite}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool.existingSlug) onToggleFavorite(tool.existingSlug);
                }}
                className={`p-1 -m-1 transition-colors ${
                  isFavorite ? 'text-accent' : 'text-subtle hover:text-accent'
                }`}
              >
                {isFavorite ? <Star className="w-3.5 h-3.5 fill-current" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              </button>
            ) : null}
            <ArrowRight
              className="w-3.5 h-3.5 text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all"
              aria-hidden
            />
          </div>
        </div>
      </article>
    </li>
  );
}
