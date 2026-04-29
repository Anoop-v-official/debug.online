import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['nginx-generator']!;

interface Cfg {
  domain: string;
  serverType: 'static' | 'reverse-proxy' | 'nodejs';
  staticRoot: string;
  upstream: string;
  ssl: boolean;
  http2: boolean;
  redirectHttp: boolean;
  gzip: boolean;
  rateLimit: boolean;
  cacheStatic: boolean;
  hsts: boolean;
}

function generate(c: Cfg): string {
  const lines: string[] = [];
  if (c.rateLimit) {
    lines.push('limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;');
    lines.push('');
  }

  if (c.ssl && c.redirectHttp) {
    lines.push('server {');
    lines.push('    listen 80;');
    lines.push(`    listen [::]:80;`);
    lines.push(`    server_name ${c.domain};`);
    lines.push('    return 301 https://$host$request_uri;');
    lines.push('}');
    lines.push('');
  }

  lines.push('server {');
  if (c.ssl) {
    lines.push(`    listen 443 ssl${c.http2 ? ' http2' : ''};`);
    lines.push(`    listen [::]:443 ssl${c.http2 ? ' http2' : ''};`);
  } else {
    lines.push('    listen 80;');
    lines.push('    listen [::]:80;');
  }
  lines.push(`    server_name ${c.domain};`);

  if (c.ssl) {
    lines.push('');
    lines.push(`    ssl_certificate     /etc/letsencrypt/live/${c.domain}/fullchain.pem;`);
    lines.push(`    ssl_certificate_key /etc/letsencrypt/live/${c.domain}/privkey.pem;`);
    lines.push('    ssl_protocols TLSv1.2 TLSv1.3;');
    lines.push("    ssl_prefer_server_ciphers off;");
  }

  if (c.hsts && c.ssl) {
    lines.push('    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;');
  }
  lines.push('    add_header X-Frame-Options "DENY" always;');
  lines.push('    add_header X-Content-Type-Options "nosniff" always;');
  lines.push('    add_header Referrer-Policy "strict-origin-when-cross-origin" always;');

  if (c.gzip) {
    lines.push('');
    lines.push('    gzip on;');
    lines.push('    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;');
    lines.push('    gzip_min_length 1024;');
  }

  lines.push('');
  if (c.serverType === 'static') {
    lines.push(`    root ${c.staticRoot};`);
    lines.push('    index index.html;');
    lines.push('');
    if (c.cacheStatic) {
      lines.push('    location ~* \\.(?:css|js|woff2?|svg|png|jpe?g|webp|gif|ico)$ {');
      lines.push('        expires 1y;');
      lines.push('        add_header Cache-Control "public, immutable";');
      lines.push('    }');
      lines.push('');
    }
    lines.push('    location / {');
    lines.push('        try_files $uri $uri/ /index.html;');
    lines.push('    }');
  } else {
    if (c.rateLimit) {
      lines.push('    location /api/ {');
      lines.push('        limit_req zone=api burst=20 nodelay;');
      lines.push(`        proxy_pass ${c.upstream};`);
      lines.push('        proxy_http_version 1.1;');
      lines.push('        proxy_set_header Host $host;');
      lines.push('        proxy_set_header X-Real-IP $remote_addr;');
      lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
      lines.push('        proxy_set_header X-Forwarded-Proto $scheme;');
      lines.push('    }');
      lines.push('');
    }
    lines.push('    location / {');
    lines.push(`        proxy_pass ${c.upstream};`);
    lines.push('        proxy_http_version 1.1;');
    lines.push('        proxy_set_header Upgrade $http_upgrade;');
    lines.push('        proxy_set_header Connection "upgrade";');
    lines.push('        proxy_set_header Host $host;');
    lines.push('        proxy_set_header X-Real-IP $remote_addr;');
    lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
    lines.push('        proxy_set_header X-Forwarded-Proto $scheme;');
    lines.push('        proxy_read_timeout 60s;');
    lines.push('    }');
  }

  lines.push('}');
  return lines.join('\n');
}

export default function NginxGenerator() {
  const [cfg, setCfg] = useState<Cfg>({
    domain: 'example.com',
    serverType: 'reverse-proxy',
    staticRoot: '/var/www/html',
    upstream: 'http://127.0.0.1:3000',
    ssl: true,
    http2: true,
    redirectHttp: true,
    gzip: true,
    rateLimit: false,
    cacheStatic: true,
    hsts: true,
  });

  const text = useMemo(() => generate(cfg), [cfg]);

  function set<K extends keyof Cfg>(k: K, v: Cfg[K]) {
    setCfg((c) => ({ ...c, [k]: v }));
  }

  return (
    <ToolFrame tool={tool} actions={<CopyButton text={text} />}>
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-3">
          <label className="text-sm text-muted block">
            Domain
            <input
              value={cfg.domain}
              onChange={(e) => set('domain', e.target.value)}
              className="input mt-1 font-mono"
            />
          </label>
          <label className="text-sm text-muted block">
            Type
            <select
              value={cfg.serverType}
              onChange={(e) => set('serverType', e.target.value as Cfg['serverType'])}
              className="input mt-1"
            >
              <option value="reverse-proxy">Reverse proxy (Node, Go, etc.)</option>
              <option value="static">Static files (SPA)</option>
              <option value="nodejs">Node.js / generic upstream</option>
            </select>
          </label>
          {cfg.serverType === 'static' ? (
            <label className="text-sm text-muted block">
              Root directory
              <input
                value={cfg.staticRoot}
                onChange={(e) => set('staticRoot', e.target.value)}
                className="input mt-1 font-mono"
              />
            </label>
          ) : (
            <label className="text-sm text-muted block">
              Upstream URL
              <input
                value={cfg.upstream}
                onChange={(e) => set('upstream', e.target.value)}
                className="input mt-1 font-mono"
              />
            </label>
          )}
          <div className="space-y-1.5">
            {(
              [
                ['ssl', 'SSL (Let\'s Encrypt paths)'],
                ['http2', 'HTTP/2'],
                ['redirectHttp', 'Redirect :80 → :443'],
                ['hsts', 'HSTS (HTTP Strict Transport Security)'],
                ['gzip', 'gzip compression'],
                ['rateLimit', 'Rate limit /api/ (10 r/s)'],
                ['cacheStatic', 'Long cache for static assets'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="text-xs text-muted flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cfg[k]}
                  onChange={(e) => set(k, e.target.checked as never)}
                  className="accent-accent"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <pre className="pane">{text}</pre>
      </div>
    </ToolFrame>
  );
}
