import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['curl-builder']!;

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
type Method = (typeof METHODS)[number];

interface Header {
  key: string;
  value: string;
}

function shellEscape(s: string): string {
  if (s === '') return "''";
  if (/^[A-Za-z0-9_./:?=&%@+\-,]+$/.test(s)) return s;
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

function buildCurl(
  method: Method,
  url: string,
  headers: Header[],
  body: string,
  followRedirects: boolean,
  insecure: boolean,
  silent: boolean,
  showHeaders: boolean,
): string {
  const parts: string[] = ['curl'];
  if (silent) parts.push('-s');
  if (showHeaders) parts.push('-i');
  if (followRedirects) parts.push('-L');
  if (insecure) parts.push('-k');
  if (method !== 'GET') {
    parts.push('-X', method);
  }
  for (const h of headers) {
    if (!h.key.trim()) continue;
    parts.push('-H', shellEscape(`${h.key}: ${h.value}`));
  }
  if (body && !['GET', 'HEAD'].includes(method)) {
    parts.push('--data-raw', shellEscape(body));
  }
  parts.push(shellEscape(url));
  return parts.join(' \\\n  ');
}

export default function CurlBuilder() {
  const [method, setMethod] = useState<Method>('POST');
  const [url, setUrl] = useState('https://api.example.com/v1/things');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer YOUR_TOKEN' },
  ]);
  const [body, setBody] = useState('{\n  "name": "thing",\n  "active": true\n}');
  const [follow, setFollow] = useState(true);
  const [insecure, setInsecure] = useState(false);
  const [silent, setSilent] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  const cmd = useMemo(
    () =>
      buildCurl(method, url, headers, body, follow, insecure, silent, showHeaders),
    [method, url, headers, body, follow, insecure, silent, showHeaders],
  );

  function setHeader(i: number, patch: Partial<Header>) {
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }

  return (
    <ToolFrame tool={tool} actions={<CopyButton text={cmd} />}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className="input w-full sm:w-32 font-mono"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input flex-1 font-mono"
            placeholder="https://api.example.com/v1/things"
            spellCheck={false}
          />
        </div>

        <div className="card p-3 space-y-2">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono">Headers</div>
          {headers.map((h, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input
                value={h.key}
                onChange={(e) => setHeader(i, { key: e.target.value })}
                className="input font-mono text-xs"
                placeholder="Header"
                spellCheck={false}
              />
              <input
                value={h.value}
                onChange={(e) => setHeader(i, { value: e.target.value })}
                className="input font-mono text-xs"
                placeholder="Value"
                spellCheck={false}
              />
              <button
                type="button"
                aria-label="Remove header"
                onClick={() => setHeaders((prev) => prev.filter((_, idx) => idx !== i))}
                className="btn-ghost text-error text-sm"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() => setHeaders((p) => [...p, { key: '', value: '' }])}
          >
            + Header
          </button>
        </div>

        {!['GET', 'HEAD'].includes(method) ? (
          <label className="text-sm text-muted block">
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              spellCheck={false}
              className="textarea mt-1 font-mono text-xs min-h-[120px]"
            />
          </label>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-2">
          <Toggle label="-L  Follow redirects" checked={follow} onChange={setFollow} />
          <Toggle label="-k  Insecure (skip TLS verify)" checked={insecure} onChange={setInsecure} />
          <Toggle label="-s  Silent (no progress meter)" checked={silent} onChange={setSilent} />
          <Toggle label="-i  Include response headers" checked={showHeaders} onChange={setShowHeaders} />
        </div>

        <OutputPane text={cmd} wrap copyLabel="Copy command" />
      </div>
    </ToolFrame>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="text-xs text-muted flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent w-4 h-4"
      />
      <span className="font-mono">{label}</span>
    </label>
  );
}
