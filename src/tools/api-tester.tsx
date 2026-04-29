import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';
import { isTauri } from '../lib/runtime';

const tool = toolBySlug['api-tester']!;

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
type Method = (typeof METHODS)[number];

interface Header {
  key: string;
  value: string;
}

interface Result {
  status: number;
  statusText: string;
  ok: boolean;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  bodyType: 'json' | 'text';
}

export default function ApiTester() {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('https://httpbin.org/get');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Accept', value: 'application/json' },
  ]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function setHeader(i: number, patch: Partial<Header>) {
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    setResult(null);
    const start = performance.now();
    try {
      const init: RequestInit = {
        method,
        headers: Object.fromEntries(
          headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value]),
        ),
      };
      if (!['GET', 'HEAD'].includes(method) && body) init.body = body;
      const res = await fetch(url, init);
      const text = await res.text();
      const ct = res.headers.get('content-type') ?? '';
      const isJson = ct.includes('json');
      let pretty = text;
      if (isJson) {
        try {
          pretty = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          /* leave raw */
        }
      }
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        responseHeaders[k] = v;
      });
      setResult({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        durationMs: Math.round(performance.now() - start),
        headers: responseHeaders,
        body: pretty,
        bodyType: isJson ? 'json' : 'text',
      });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'request failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolFrame tool={tool}>
      <form onSubmit={send} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className="input w-full sm:w-32 font-mono"
            aria-label="Method"
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
          <button type="submit" className="btn-accent" disabled={busy}>
            {busy ? 'Sending…' : 'Send'}
          </button>
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
          <div>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              Body
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              spellCheck={false}
              className="textarea font-mono text-xs min-h-[120px]"
              placeholder='{"key": "value"}'
            />
          </div>
        ) : null}

        {!isTauri ? (
          <p className="text-2xs text-subtle font-mono">
            Browser CORS may block requests to APIs that don't return permissive headers. The Linux desktop build of debugdaily skips this restriction.
          </p>
        ) : null}
      </form>

      {err ? (
        <pre className="card p-3 mt-4 text-xs font-mono text-error">{err}</pre>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="card p-3 flex flex-wrap items-center gap-3 text-sm font-mono">
            <span
              className={
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ' +
                (result.ok
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'bg-error/10 text-error border border-error/30')
              }
            >
              {result.status} {result.statusText}
            </span>
            <span className="text-muted">{result.durationMs} ms</span>
            <CopyButton text={result.body} />
          </div>

          <details className="card p-3" open>
            <summary className="cursor-pointer text-2xs uppercase tracking-wide text-subtle font-mono">
              Response headers ({Object.keys(result.headers).length})
            </summary>
            <ul className="mt-2 text-xs font-mono space-y-0.5">
              {Object.entries(result.headers).map(([k, v]) => (
                <li key={k} className="flex gap-2">
                  <span className="text-muted">{k}</span>
                  <span className="text-text break-all">{v}</span>
                </li>
              ))}
            </ul>
          </details>

          <div className="card p-3">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">Body</div>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-[60vh] overflow-auto">
              {result.body || <span className="text-subtle">empty</span>}
            </pre>
          </div>
        </div>
      ) : null}
    </ToolFrame>
  );
}
