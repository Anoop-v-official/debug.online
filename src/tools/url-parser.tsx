import { useEffect, useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { consumeSmartPaste } from '../lib/smartPaste';

const tool = toolBySlug['url-parser']!;

export default function UrlParser() {
  const [input, setInput] = useState(
    'https://api.example.com:8443/v1/users?role=admin&limit=10#section-2',
  );

  useEffect(() => {
    const v = consumeSmartPaste('url-parser');
    if (v) setInput(v);
  }, []);

  const result = useMemo(() => {
    try {
      const u = new URL(input);
      return { ok: true as const, u };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'invalid URL' };
    }
  }, [input]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input }),
        applyState: (s) => {
          const v = s as { input?: string };
          if (typeof v.input === 'string') setInput(v.input);
        },
      }}
    >
      <div className="space-y-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          spellCheck={false}
          placeholder="https://example.com/path?q=1"
        />
        {result.ok ? (
          <div className="card p-3 text-sm font-mono space-y-1.5">
            <Row label="Protocol" value={result.u.protocol} />
            <Row label="Host" value={result.u.host} />
            <Row label="Hostname" value={result.u.hostname} />
            <Row label="Port" value={result.u.port || '(default)'} />
            <Row label="Path" value={result.u.pathname} />
            <Row label="Hash" value={result.u.hash || '(none)'} />
            <Row label="Origin" value={result.u.origin} />
            {[...result.u.searchParams.entries()].length > 0 ? (
              <div>
                <div className="text-subtle text-2xs uppercase tracking-wide mt-2 mb-1">
                  Query
                </div>
                <ul className="space-y-0.5">
                  {[...result.u.searchParams.entries()].map(([k, v], i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted">{k}</span>
                      <span className="text-subtle">=</span>
                      <span className="text-accent break-all">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">{result.error}</pre>
        )}
      </div>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-20 shrink-0">
        {label}
      </span>
      <span className="text-text break-all">{value}</span>
    </div>
  );
}
