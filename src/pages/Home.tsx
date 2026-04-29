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
  Check,
  Command,
  Copy,
  Flame,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useSeo } from '../lib/seo';
import { toolBySlug } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';

type Category =
  | 'all'
  | 'backend'
  | 'frontend'
  | 'devops'
  | 'sysadmin'
  | 'security'
  | 'trending'
  | 'favorites';

interface MarketingTool {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'all' | 'trending' | 'favorites'>;
  icon: string;
  badge: string;
  searchVolume: string;
  searchVolumeNum: number;
  tags: string[];
  /** Slug in our existing tool registry, if implemented. */
  existingSlug?: string;
  /** Numeric badge state for filter logic. */
  isNew?: boolean;
}

const ROLE_META: Record<
  Exclude<Category, 'all' | 'trending' | 'favorites'>,
  { label: string; color: string; ring: string; bg: string; border: string; dot: string; emoji: string }
> = {
  backend: {
    label: 'Backend Dev',
    color: 'text-role-backend',
    ring: 'ring-role-backend/40',
    bg: 'bg-role-backend/10',
    border: 'border-role-backend',
    dot: 'bg-role-backend',
    emoji: '🔵',
  },
  frontend: {
    label: 'Frontend Dev',
    color: 'text-role-frontend',
    ring: 'ring-role-frontend/40',
    bg: 'bg-role-frontend/10',
    border: 'border-role-frontend',
    dot: 'bg-role-frontend',
    emoji: '🟡',
  },
  devops: {
    label: 'DevOps / SRE',
    color: 'text-role-devops',
    ring: 'ring-role-devops/40',
    bg: 'bg-role-devops/10',
    border: 'border-role-devops',
    dot: 'bg-role-devops',
    emoji: '🔴',
  },
  sysadmin: {
    label: 'SysAdmin',
    color: 'text-role-sysadmin',
    ring: 'ring-role-sysadmin/40',
    bg: 'bg-role-sysadmin/10',
    border: 'border-role-sysadmin',
    dot: 'bg-role-sysadmin',
    emoji: '🟢',
  },
  security: {
    label: 'Security',
    color: 'text-role-security',
    ring: 'ring-role-security/40',
    bg: 'bg-role-security/10',
    border: 'border-role-security',
    dot: 'bg-role-security',
    emoji: '🟣',
  },
};

const TABS: { id: Category; label: string; icon: string; tone: string }[] = [
  { id: 'all', label: 'All Tools', icon: '◇', tone: 'text-text' },
  { id: 'backend', label: 'Backend', icon: '🔵', tone: 'text-role-backend' },
  { id: 'frontend', label: 'Frontend', icon: '🟡', tone: 'text-role-frontend' },
  { id: 'devops', label: 'DevOps / SRE', icon: '🔴', tone: 'text-role-devops' },
  { id: 'sysadmin', label: 'SysAdmin', icon: '🟢', tone: 'text-role-sysadmin' },
  { id: 'security', label: 'Security', icon: '🟣', tone: 'text-role-security' },
  { id: 'trending', label: 'Most Searched', icon: '⚡', tone: 'text-role-trending' },
  { id: 'favorites', label: 'Favorites', icon: '★', tone: 'text-accent' },
];

const TOOLS: MarketingTool[] = [
  // Backend
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description:
      'Format, validate, minify and compare JSON instantly. Better than jsonlint — supports 5MB+ files.',
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
    name: 'JWT Decoder & Inspector',
    description:
      'Decode JWT tokens instantly. See header, payload, expiry countdown. No data sent to server.',
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
    description:
      'Test REST APIs directly in browser. GET/POST/PUT/DELETE, custom headers, body editor. Postman alternative, no install needed.',
    category: 'backend',
    icon: '⚡',
    badge: '✨ New',
    searchVolume: '540K/mo',
    searchVolumeNum: 540_000,
    tags: ['api', 'rest', 'postman', 'http', 'request', 'test'],
    isNew: true,
    existingSlug: 'api-tester',
  },
  {
    id: 'cron-builder',
    name: 'Cron Expression Builder',
    description:
      'Build cron expressions visually. Plain English explanation + next 10 run times. Supports AWS, Unix, Quartz formats.',
    category: 'backend',
    icon: '⏰',
    badge: '🔥 Most Searched',
    searchVolume: '720K/mo',
    searchVolumeNum: 720_000,
    tags: ['cron', 'schedule', 'expression', 'unix', 'aws'],
    existingSlug: 'cron-parser',
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Explainer',
    description:
      'Live regex matching with color highlights. AI-powered explanation of what each part does. Supports JS, Python, Go flavors.',
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
    name: 'SQL Formatter & Beautifier',
    description:
      'Paste messy SQL, get clean formatted output. Supports MySQL, PostgreSQL, MSSQL. Minify mode included.',
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
    description:
      'Encode or decode Base64 instantly. Supports text, URLs, and file uploads. URL-safe variant included.',
    category: 'backend',
    icon: '64',
    badge: '🔥 Most Searched',
    searchVolume: '1.8M/mo',
    searchVolumeNum: 1_800_000,
    tags: ['base64', 'encode', 'decode', 'binary', 'string'],
    existingSlug: 'base64',
  },
  {
    id: 'unix-timestamp',
    name: 'Unix Timestamp Converter',
    description:
      'Convert Unix timestamps to human dates and back. Millisecond support. Timezone aware. One-click current timestamp.',
    category: 'backend',
    icon: '📅',
    badge: '🔥 Most Searched',
    searchVolume: '950K/mo',
    searchVolumeNum: 950_000,
    tags: ['unix', 'timestamp', 'epoch', 'date', 'convert', 'time'],
    existingSlug: 'timestamp-converter',
  },
  {
    id: 'uuid-generator',
    name: 'UUID / ULID Generator',
    description:
      'Generate UUIDs v1/v4/v7 and ULIDs in bulk. Copy all with one click. Validate existing UUIDs.',
    category: 'backend',
    icon: '🆔',
    badge: '',
    searchVolume: '380K/mo',
    searchVolumeNum: 380_000,
    tags: ['uuid', 'ulid', 'guid', 'generate', 'unique', 'id'],
    existingSlug: 'uuid-generator',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description:
      'Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text or files. Compare two hashes instantly.',
    category: 'backend',
    icon: '#',
    badge: '',
    searchVolume: '290K/mo',
    searchVolumeNum: 290_000,
    tags: ['hash', 'md5', 'sha256', 'sha512', 'checksum', 'crypto'],
    existingSlug: 'hash-generator',
  },
  {
    id: 'http-status',
    name: 'HTTP Status Code Reference',
    description:
      'Every HTTP status code explained with use cases, what causes it, and how to fix it. Searchable + filterable.',
    category: 'backend',
    icon: '200',
    badge: '🔥 Most Searched',
    searchVolume: '670K/mo',
    searchVolumeNum: 670_000,
    tags: ['http', 'status', '404', '500', '200', 'error', 'code'],
    existingSlug: 'http-status',
  },
  {
    id: 'bcrypt-tester',
    name: 'Bcrypt Hash Tester',
    description:
      'Test and generate bcrypt password hashes in browser. Choose work factor. Verify existing hashes. 100% client-side.',
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
    description:
      'px → rem → em → vh → vw → % and back. Set your base font size. Live preview. Most accurate converter online.',
    category: 'frontend',
    icon: 'px',
    badge: '🔥 Most Searched',
    searchVolume: '520K/mo',
    searchVolumeNum: 520_000,
    tags: ['css', 'px', 'rem', 'em', 'unit', 'convert'],
    existingSlug: 'css-unit-converter',
  },
  {
    id: 'color-converter',
    name: 'Color Converter & Picker',
    description:
      'HEX ↔ RGB ↔ HSL ↔ OKLCH ↔ Tailwind name. Color picker included. CSS variable output. Copy in any format.',
    category: 'frontend',
    icon: '🎨',
    badge: '🔥 Most Searched',
    searchVolume: '780K/mo',
    searchVolumeNum: 780_000,
    tags: ['color', 'hex', 'rgb', 'hsl', 'picker', 'css', 'tailwind'],
    existingSlug: 'color-converter',
  },
  {
    id: 'gradient-generator',
    name: 'CSS Gradient Generator',
    description:
      'Visual gradient builder with linear, radial, conic. Copy CSS instantly. 50+ presets. Mesh gradient support.',
    category: 'frontend',
    icon: '🌈',
    badge: '',
    searchVolume: '340K/mo',
    searchVolumeNum: 340_000,
    tags: ['gradient', 'css', 'linear', 'radial', 'background'],
    existingSlug: 'gradient-generator',
  },
  {
    id: 'shadow-generator',
    name: 'Box & Text Shadow Generator',
    description:
      'Visual shadow builder with multi-layer support. Live preview. One-click copy CSS. Tailwind class output.',
    category: 'frontend',
    icon: '🔳',
    badge: '',
    searchVolume: '220K/mo',
    searchVolumeNum: 220_000,
    tags: ['shadow', 'box-shadow', 'css', 'tailwind', 'ui'],
    existingSlug: 'shadow-generator',
  },
  {
    id: 'meta-preview',
    name: 'Meta Tag & OG Preview',
    description:
      'See exactly how your URL looks on Google, Twitter, LinkedIn, and WhatsApp. Paste URL or edit tags manually. Fix your SEO previews.',
    category: 'frontend',
    icon: '🔗',
    badge: '✨ New',
    searchVolume: '190K/mo',
    searchVolumeNum: 190_000,
    tags: ['meta', 'og', 'seo', 'opengraph', 'twitter', 'preview'],
    isNew: true,
    existingSlug: 'meta-preview',
  },
  {
    id: 'contrast-checker',
    name: 'Color Contrast Checker',
    description:
      'WCAG 2.1 AA/AAA compliance checker. Visual pass/fail. Suggests accessible alternatives. Bulk check mode.',
    category: 'frontend',
    icon: '♿',
    badge: '',
    searchVolume: '160K/mo',
    searchVolumeNum: 160_000,
    tags: ['contrast', 'wcag', 'accessibility', 'a11y', 'color'],
    existingSlug: 'contrast-checker',
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer & Editor',
    description:
      'Paste SVG code, reduce file size up to 80%. Preview before/after. Remove hidden elements. SVGO-powered.',
    category: 'frontend',
    icon: '⭐',
    badge: '',
    searchVolume: '140K/mo',
    searchVolumeNum: 140_000,
    tags: ['svg', 'optimize', 'minify', 'compress', 'vector'],
    existingSlug: 'svg-optimizer',
  },
  {
    id: 'responsive-tester',
    name: 'Responsive Design Tester',
    description:
      'Test any URL across 20+ device sizes simultaneously. iPhone, iPad, Android, desktop. No extensions needed.',
    category: 'frontend',
    icon: '📱',
    badge: '🔥 Most Searched',
    searchVolume: '410K/mo',
    searchVolumeNum: 410_000,
    tags: ['responsive', 'mobile', 'test', 'device', 'breakpoint'],
    existingSlug: 'responsive-tester',
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64 Converter',
    description:
      'Upload any image, get Base64 data URL instantly. Use directly in CSS/HTML. Supports PNG, JPG, SVG, WebP.',
    category: 'frontend',
    icon: '🖼️',
    badge: '',
    searchVolume: '280K/mo',
    searchVolumeNum: 280_000,
    tags: ['image', 'base64', 'data-url', 'embed', 'css'],
    existingSlug: 'image-to-base64',
  },

  // DevOps
  {
    id: 'yaml-validator',
    name: 'YAML Validator & Formatter',
    description:
      'Paste YAML, get instant error detection with line numbers. Convert YAML ↔ JSON. K8s manifest aware.',
    category: 'devops',
    icon: '📋',
    badge: '🔥 Most Searched',
    searchVolume: '380K/mo',
    searchVolumeNum: 380_000,
    tags: ['yaml', 'validate', 'format', 'kubernetes', 'docker', 'k8s'],
    existingSlug: 'yaml-validator',
  },
  {
    id: 'dockerfile-linter',
    name: 'Dockerfile Linter',
    description:
      'Paste your Dockerfile, get issues, anti-patterns, and best practice fixes. Layer size analysis. Nothing like this exists online.',
    category: 'devops',
    icon: '🐳',
    badge: '✨ New',
    searchVolume: '210K/mo',
    searchVolumeNum: 210_000,
    tags: ['dockerfile', 'docker', 'lint', 'build', 'image', 'layer'],
    isNew: true,
    existingSlug: 'dockerfile-linter',
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description:
      'Enter any domain — see expiry date, issuer, certificate chain, SANs, and TLS version. Set email alerts before expiry.',
    category: 'devops',
    icon: '🛡️',
    badge: '🔥 Most Searched',
    searchVolume: '560K/mo',
    searchVolumeNum: 560_000,
    tags: ['ssl', 'tls', 'certificate', 'https', 'expiry', 'domain'],
    existingSlug: 'ssl-check',
  },
  {
    id: 'nginx-generator',
    name: 'Nginx Config Generator',
    description:
      'Answer a few questions, get production-ready Nginx config. Reverse proxy, SSL, caching, rate limiting. No more googling configs.',
    category: 'devops',
    icon: '⚙️',
    badge: '✨ New',
    searchVolume: '320K/mo',
    searchVolumeNum: 320_000,
    tags: ['nginx', 'config', 'reverse-proxy', 'ssl', 'server'],
    isNew: true,
    existingSlug: 'nginx-generator',
  },
  {
    id: 'cidr-calculator',
    name: 'CIDR / Subnet Calculator',
    description:
      'Enter any IP/CIDR, get full subnet breakdown — network address, broadcast, usable IPs, wildcard. AWS VPC friendly.',
    category: 'devops',
    icon: '🌐',
    badge: '',
    searchVolume: '240K/mo',
    searchVolumeNum: 240_000,
    tags: ['cidr', 'subnet', 'ip', 'network', 'vpc', 'aws', 'mask'],
    existingSlug: 'cidr-calculator',
  },
  {
    id: 'env-diff',
    name: '.ENV File Diff & Validator',
    description:
      'Paste two .env files, instantly see missing keys, changed values, and extras. Never deploy with missing env vars again.',
    category: 'devops',
    icon: '🔄',
    badge: '✨ New',
    searchVolume: '95K/mo',
    searchVolumeNum: 95_000,
    tags: ['env', 'environment', 'diff', 'compare', 'variables', 'dotenv'],
    isNew: true,
    existingSlug: 'env-diff',
  },
  {
    id: 'http-headers',
    name: 'HTTP Headers Inspector',
    description:
      'Enter any URL, see all response headers, security headers score, CORS config, and cache settings. Actionable fixes included.',
    category: 'devops',
    icon: '🔍',
    badge: '',
    searchVolume: '175K/mo',
    searchVolumeNum: 175_000,
    tags: ['headers', 'http', 'cors', 'security', 'cache', 'inspect'],
    existingSlug: 'http-headers',
  },

  // SysAdmin
  {
    id: 'ip-lookup',
    name: 'IP Lookup & Info',
    description:
      'Your public IP + ISP + location + IPv4/IPv6 + VPN detection + blacklist check + latency to major servers. The best IP tool online.',
    category: 'sysadmin',
    icon: '📡',
    badge: '🔥 #1 Most Searched',
    searchVolume: '3.6M/mo',
    searchVolumeNum: 3_600_000,
    tags: ['ip', 'address', 'lookup', 'location', 'vpn', 'isp', 'blacklist'],
    existingSlug: 'ip-lookup',
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup & Propagation',
    description:
      'Check A, MX, TXT, CNAME, NS records instantly. See propagation status across 20 global servers. Live world map view.',
    category: 'sysadmin',
    icon: '🔎',
    badge: '🔥 Most Searched',
    searchVolume: '820K/mo',
    searchVolumeNum: 820_000,
    tags: ['dns', 'lookup', 'propagation', 'mx', 'cname', 'nameserver'],
    existingSlug: 'dns-lookup',
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description:
      'Full domain registration info — registrar, creation date, expiry, nameservers. Bulk WHOIS for multiple domains.',
    category: 'sysadmin',
    icon: '📂',
    badge: '🔥 Most Searched',
    searchVolume: '640K/mo',
    searchVolumeNum: 640_000,
    tags: ['whois', 'domain', 'registrar', 'expiry', 'lookup'],
    existingSlug: 'whois',
  },
  {
    id: 'ping-test',
    name: 'Global Ping Test',
    description:
      'Test latency to any host from 10+ locations worldwide. See which region has the highest lag. Great for CDN debugging.',
    category: 'sysadmin',
    icon: '📶',
    badge: '',
    searchVolume: '390K/mo',
    searchVolumeNum: 390_000,
    tags: ['ping', 'latency', 'speed', 'test', 'global', 'cdn'],
    existingSlug: 'ping-test',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description:
      'Generate ultra-strong passwords. Custom length, symbols, numbers. Passphrase mode. Strength meter. 100% client-side.',
    category: 'sysadmin',
    icon: '🔐',
    badge: '🔥 Most Searched',
    searchVolume: '1.1M/mo',
    searchVolumeNum: 1_100_000,
    tags: ['password', 'generate', 'strong', 'random', 'secure'],
    existingSlug: 'password-generator',
  },
  {
    id: 'ssh-keygen',
    name: 'SSH Key Generator',
    description:
      'Generate RSA (2048/4096) or Ed25519 SSH key pairs entirely in browser. Download private/public keys. Zero server contact.',
    category: 'sysadmin',
    icon: '🗝️',
    badge: '',
    searchVolume: '180K/mo',
    searchVolumeNum: 180_000,
    tags: ['ssh', 'keygen', 'rsa', 'ed25519', 'key', 'generate'],
    existingSlug: 'ssh-keygen',
  },
  {
    id: 'uptime-checker',
    name: 'Website Uptime Checker',
    description:
      'Is it down for everyone or just you? Check from 5 global locations. Response time breakdown. Status code + redirect chain.',
    category: 'sysadmin',
    icon: '✅',
    badge: '🔥 Most Searched',
    searchVolume: '870K/mo',
    searchVolumeNum: 870_000,
    tags: ['uptime', 'down', 'website', 'check', 'monitor', 'status'],
    existingSlug: 'uptime-checker',
  },

  // Security
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description:
      'Encode or decode URLs and query strings. Handles special characters, percent encoding, and double-encoding edge cases.',
    category: 'security',
    icon: '🔗',
    badge: '🔥 Most Searched',
    searchVolume: '760K/mo',
    searchVolumeNum: 760_000,
    tags: ['url', 'encode', 'decode', 'percent', 'uri', 'query'],
    existingSlug: 'url-encode',
  },
  {
    id: 'ip-blacklist',
    name: 'IP Blacklist Checker',
    description:
      'Check if an IP is blacklisted across 100+ DNSBL databases. Email deliverability impact. Bulk check support.',
    category: 'security',
    icon: '🚫',
    badge: '',
    searchVolume: '210K/mo',
    searchVolumeNum: 210_000,
    tags: ['blacklist', 'ip', 'spam', 'dnsbl', 'email', 'reputation'],
    existingSlug: 'ip-blacklist',
  },
  {
    id: 'fake-data-generator',
    name: 'Test Data Generator',
    description:
      'Generate realistic fake names, emails, addresses, phone numbers, credit card patterns for testing. Bulk export as JSON/CSV.',
    category: 'security',
    icon: '🎭',
    badge: '✨ New',
    searchVolume: '290K/mo',
    searchVolumeNum: 290_000,
    tags: ['fake', 'test', 'data', 'mock', 'generate', 'dummy'],
    isNew: true,
    existingSlug: 'fake-data-generator',
  },
  {
    id: 'csp-generator',
    name: 'CSP Header Generator',
    description:
      'Build a Content Security Policy header visually. Understand each directive. Test against your site. Copy-ready output.',
    category: 'security',
    icon: '🛡️',
    badge: '',
    searchVolume: '95K/mo',
    searchVolumeNum: 95_000,
    tags: ['csp', 'content-security-policy', 'header', 'xss', 'security'],
    existingSlug: 'csp-generator',
  },
  {
    id: 'email-header-analyzer',
    name: 'Email Header Analyzer',
    description:
      'Paste raw email headers, detect spoofing, trace routing path, check SPF/DKIM/DMARC. Identify spam and phishing sources.',
    category: 'security',
    icon: '📧',
    badge: '✨ New',
    searchVolume: '145K/mo',
    searchVolumeNum: 145_000,
    tags: ['email', 'header', 'spf', 'dkim', 'dmarc', 'spam', 'phishing'],
    isNew: true,
    existingSlug: 'email-header-analyzer',
  },
];

const TYPING_LINES = [
  'Formatting JSON...',
  'Decoding JWT...',
  'Checking SSL expiry...',
  'Generating UUID...',
  'Converting timestamp...',
  'Resolving DNS...',
  'Hashing input...',
  'Validating YAML...',
];

function fuzzyScore(needle: string, haystack: string): number {
  if (!needle) return 0;
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  if (h.includes(n)) return 1000 - h.indexOf(n);
  // simple subsequence score
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

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
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

const VALID_TABS: Category[] = [
  'all',
  'backend',
  'frontend',
  'devops',
  'sysadmin',
  'security',
  'trending',
  'favorites',
];

function readHashCategory(): Category {
  if (typeof window === 'undefined') return 'all';
  const raw = window.location.hash.replace('#', '').toLowerCase();
  return (VALID_TABS as string[]).includes(raw) ? (raw as Category) : 'all';
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
  const [tab, setTab] = useState<Category>(readHashCategory);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const [comingSoon, setComingSoon] = useState<MarketingTool | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistDone, setWaitlistDone] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const favoriteSlugs = useFavoritesStore((s) => s.slugs);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  // Stat counters
  const toolCount = useCountUp(TOOLS.length);
  const userCount = useCountUp(10_000);
  const typing = useTypingCycle(TYPING_LINES);

  // Hash sync
  useEffect(() => {
    function onHash() {
      setTab(readHashCategory());
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function selectTab(next: Category) {
    setTab(next);
    setFocusIdx(0);
    if (next === 'all') {
      history.replaceState(null, '', '/');
    } else {
      history.replaceState(null, '', `#${next}`);
    }
  }

  // Global CMD+K to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        // Already handled by App for palette; we steal it only if hero search is offscreen?
        // Defer: also focus our hero input as a friendly UX bonus.
        const el = searchInputRef.current;
        if (el && document.activeElement !== el) {
          // App's handler already fires palette — let palette win. We don't focus here.
        }
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Filter + sort
  const filteredTools = useMemo<MarketingTool[]>(() => {
    let pool = TOOLS;
    if (tab === 'trending') {
      pool = [...TOOLS].sort((a, b) => b.searchVolumeNum - a.searchVolumeNum);
    } else if (tab === 'favorites') {
      const set = new Set(favoriteSlugs);
      pool = TOOLS.filter((t) => t.existingSlug && set.has(t.existingSlug));
    } else if (tab !== 'all') {
      pool = TOOLS.filter((t) => t.category === tab);
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
  }, [tab, query, favoriteSlugs]);

  // Reset focus on results change
  useEffect(() => {
    setFocusIdx(0);
  }, [tab, query]);

  function openTool(tool: MarketingTool) {
    if (tool.existingSlug && toolBySlug[tool.existingSlug]) {
      navigate(`/tools/${tool.existingSlug}`);
    } else {
      setWaitlistEmail('');
      setWaitlistDone(false);
      setComingSoon(tool);
    }
  }

  function onSearchKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx((i) => Math.min(filteredTools.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const t = filteredTools[focusIdx];
      if (t) openTool(t);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  }

  return (
    <div className="-mx-4 sm:-mx-6 -mt-6 sm:-mt-8 relative">
      {/* Subtle scanline + grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-scanlines opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-grid-fade"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-2">
        <HeroSection
          searchInputRef={searchInputRef}
          query={query}
          setQuery={setQuery}
          onSearchKey={onSearchKey}
          toolCount={toolCount}
          userCount={userCount}
          typing={typing}
          openPalette={onOpenPalette}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <RoleTabs activeTab={tab} onSelect={selectTab} />

        <ToolsGrid
          tools={filteredTools}
          focusIdx={focusIdx}
          favoriteSlugs={favoriteSlugs}
          onToggleFavorite={(slug) => toggleFavorite(slug)}
          onOpen={openTool}
          query={query}
          tab={tab}
        />
      </div>

      <BottomTicker />

      <ComingSoonModal
        tool={comingSoon}
        onClose={() => setComingSoon(null)}
        email={waitlistEmail}
        setEmail={setWaitlistEmail}
        done={waitlistDone}
        onSubmit={() => {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waitlistEmail)) return;
          try {
            const key = 'debugdaily:waitlist';
            const list = JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
            if (comingSoon) list.push(`${comingSoon.id}:${waitlistEmail}`);
            localStorage.setItem(key, JSON.stringify(list));
          } catch {
            /* no-op */
          }
          setWaitlistDone(true);
        }}
      />
    </div>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

interface HeroProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  query: string;
  setQuery: (s: string) => void;
  onSearchKey: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  toolCount: number;
  userCount: number;
  typing: string;
  openPalette: () => void;
}

function HeroSection({
  searchInputRef,
  query,
  setQuery,
  onSearchKey,
  toolCount,
  userCount,
  typing,
  openPalette,
}: HeroProps) {
  return (
    <section className="space-y-7">
      <div className="inline-flex items-center gap-2 chip border-accent/40 text-accent bg-accent/5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
        Open source · Free forever · No login
      </div>

      <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02] max-w-4xl">
        The only tab you'll keep open <span className="text-accent">all day</span>.
      </h1>

      <p className="text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
        50+ tools for Backend, Frontend, DevOps, SRE & SysAdmin — faster,
        cleaner, and better than anything else online.
      </p>

      {/* Live stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-muted">
        <Stat>
          <span className="text-text font-semibold">{toolCount}+</span> Tools
        </Stat>
        <Sep />
        <Stat>
          Used by <span className="text-text font-semibold">{userCount.toLocaleString()}+</span> developers
        </Stat>
        <Sep />
        <Stat>No login required</Stat>
        <Sep />
        <Stat className="text-accent">100% free</Stat>
      </div>

      {/* Terminal */}
      <div className="card font-mono text-sm overflow-hidden max-w-2xl">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-surface-2/50">
          <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
          <span className="ml-2 text-2xs text-subtle uppercase tracking-wider">
            ~/debugdaily
          </span>
        </div>
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-accent">$</span>
          <span className="text-text">{typing}</span>
          <span className="inline-block w-1.5 h-4 bg-accent align-middle animate-blink" />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <div className="relative">
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
            placeholder="Search 50+ tools... (e.g. JSON formatter, IP lookup, cron)"
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
      </div>
    </section>
  );
}

function Stat({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
function Sep() {
  return <span aria-hidden className="text-subtle/60">·</span>;
}

/* ─────────────────────────────  ROLE TABS  ───────────────────────────── */

function RoleTabs({ activeTab, onSelect }: { activeTab: Category; onSelect: (c: Category) => void }) {
  return (
    <nav
      role="tablist"
      aria-label="Filter tools by role"
      className="overflow-x-auto -mx-4 sm:mx-0 mb-6 scrollbar-hide"
    >
      <div className="flex items-center gap-2 px-4 sm:px-0 min-w-max">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(t.id)}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-all
                ${
                  active
                    ? `${t.tone} border-current bg-current/10 shadow-[0_0_18px_-6px_currentColor]`
                    : 'text-muted border-border bg-surface hover:text-text hover:border-border-strong'
                }`}
            >
              <span aria-hidden className="text-base leading-none">
                {t.icon}
              </span>
              <span>{t.label}</span>
              {active ? (
                <span className="absolute -bottom-px left-3 right-3 h-px bg-current/70" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─────────────────────────────  TOOLS GRID  ───────────────────────────── */

interface GridProps {
  tools: MarketingTool[];
  focusIdx: number;
  favoriteSlugs: string[];
  onToggleFavorite: (slug: string) => void;
  onOpen: (tool: MarketingTool) => void;
  query: string;
  tab: Category;
}

function ToolsGrid({ tools, focusIdx, favoriteSlugs, onToggleFavorite, onOpen, query, tab }: GridProps) {
  if (tools.length === 0) {
    return (
      <div className="card p-10 text-center space-y-3">
        <div className="text-2xl">¯\_(ツ)_/¯</div>
        <p className="text-muted text-sm">
          {tab === 'favorites' ? (
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
    <ul
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Developer tools"
    >
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

interface CardProps {
  tool: MarketingTool;
  focused: boolean;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  onOpen: (tool: MarketingTool) => void;
  stagger: number;
}

function ToolCard({ tool, focused, isFavorite, onToggleFavorite, onOpen, stagger }: CardProps) {
  const meta = ROLE_META[tool.category];
  const [copied, setCopied] = useState(false);
  const built = !!tool.existingSlug;

  function copyShareLink(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}${
      built ? `/tools/${tool.existingSlug}` : `/?tool=${tool.id}`
    }`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1100);
      })
      .catch(() => {
        /* no-op */
      });
  }

  return (
    <li
      data-keywords={tool.tags.join(',')}
      data-category={tool.category}
      style={{
        animationDelay: `${Math.min(stagger * 30, 360)}ms`,
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
        className={`group relative card p-5 cursor-pointer transition-all duration-200
                    hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2
                    ${focused ? `ring-2 ${meta.ring}` : ''}
                    overflow-hidden`}
      >
        {/* Left category accent */}
        <span
          aria-hidden
          className={`absolute left-0 top-0 bottom-0 w-[3px] ${meta.dot}`}
        />

        {/* Glow on hover */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${meta.bg}`}
        />

        <div className="relative flex items-start gap-3 mb-2">
          <span
            aria-hidden
            className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md font-mono text-base font-semibold border border-border bg-surface-2 ${meta.color}`}
          >
            {tool.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-mono font-semibold text-text leading-tight">
                {tool.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-2xs uppercase tracking-wider font-mono">
              <span className={`${meta.color}`}>{meta.label}</span>
              <span className="text-subtle">·</span>
              <span className="text-subtle">{tool.searchVolume}</span>
            </div>
          </div>

          {/* hover actions */}
          <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {built ? (
              <button
                type="button"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={isFavorite}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool.existingSlug) onToggleFavorite(tool.existingSlug);
                }}
                className={`p-1.5 rounded-md hover:bg-surface ${
                  isFavorite ? 'text-accent' : 'text-subtle hover:text-accent'
                }`}
              >
                {isFavorite ? <Star className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Copy tool link"
              onClick={copyShareLink}
              className="p-1.5 rounded-md text-subtle hover:text-accent hover:bg-surface"
            >
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="relative text-sm text-muted leading-relaxed mb-3">
          {tool.description}
        </p>

        <div className="relative flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tool.badge ? <Badge raw={tool.badge} /> : null}
            {!built && tool.badge !== '✨ New' && !tool.isNew ? (
              <span className="chip text-subtle">Coming soon</span>
            ) : null}
            {built ? (
              <span className="chip text-accent border-accent/30 bg-accent/10">
                Live
              </span>
            ) : null}
          </div>

          <span
            aria-hidden
            className="inline-flex items-center gap-1 text-xs font-mono text-subtle group-hover:text-accent transition-colors"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              Open
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </li>
  );
}

function Badge({ raw }: { raw: string }) {
  if (raw.includes('Most Searched') || raw.includes('#1')) {
    return (
      <span className="chip text-role-trending border-role-trending/30 bg-role-trending/10">
        <Flame className="w-3 h-3" aria-hidden />
        {raw.replace('🔥 ', '').replace('🔥', '')}
      </span>
    );
  }
  if (raw.includes('New')) {
    return (
      <span className="chip text-cyan border-cyan/30 bg-cyan/10">
        <Sparkles className="w-3 h-3" aria-hidden />
        New
      </span>
    );
  }
  return <span className="chip">{raw}</span>;
}

/* ─────────────────────────────  TICKER  ───────────────────────────── */

function BottomTicker() {
  const items = TOOLS.slice(0, 24).map((t) => t.name);
  const doubled = [...items, ...items];
  return (
    <section className="relative border-y border-border bg-surface/40 overflow-hidden mt-4">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
      <div className="flex items-center gap-8 py-3 animate-ticker w-max font-mono text-xs text-muted whitespace-nowrap">
        {doubled.map((name, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="text-accent">›</span>
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────  COMING SOON MODAL  ───────────────────────────── */

interface ModalProps {
  tool: MarketingTool | null;
  onClose: () => void;
  email: string;
  setEmail: (s: string) => void;
  done: boolean;
  onSubmit: () => void;
}

function ComingSoonModal({ tool, onClose, email, setEmail, done, onSubmit }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (tool) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, onClose]);

  if (!tool) return null;
  const meta = ROLE_META[tool.category];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md card p-6 shadow-glow animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-md text-subtle hover:text-text hover:bg-surface-2"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span
            className={`inline-flex items-center justify-center w-12 h-12 rounded-md font-mono text-lg font-semibold border border-border bg-surface-2 ${meta.color}`}
          >
            {tool.icon}
          </span>
          <div>
            <h2 id="coming-soon-title" className="font-display text-xl font-semibold">
              {tool.name}
            </h2>
            <span className={`text-2xs font-mono uppercase tracking-wider ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed mb-5">
          {tool.description}
        </p>

        {done ? (
          <div className="card p-4 bg-accent/5 border-accent/30 text-sm text-text">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-accent" />
              <span className="font-semibold">You're on the list.</span>
            </div>
            <p className="text-muted text-xs">
              We'll email you the moment {tool.name} ships.
            </p>
          </div>
        ) : (
          <>
            <p className="text-2xs font-mono uppercase tracking-wider text-subtle mb-2">
              Tool in development — join the waitlist
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.dev"
                required
                aria-label="Email"
                className="input flex-1"
              />
              <button type="submit" className="btn-accent">
                Notify me
              </button>
            </form>
            <p className="text-2xs text-subtle mt-3">
              No spam. One email when this tool launches. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

