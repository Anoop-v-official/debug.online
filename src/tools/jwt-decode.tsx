import { useEffect, useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { OutputPane } from '../components/OutputPane';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';
import { consumeSmartPaste } from '../lib/smartPaste';

const tool = toolBySlug['jwt-decode']!;

function b64UrlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const norm = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(norm);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

interface Decoded {
  header: unknown;
  payload: unknown;
  signature: string;
  expIn?: number;
}

function decode(token: string): { ok: true; data: Decoded } | { ok: false; error: string } {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'A JWT must have three dot-separated parts.' };
  }
  try {
    const header = JSON.parse(b64UrlDecode(parts[0]));
    const payload = JSON.parse(b64UrlDecode(parts[1]));
    const exp = (payload as { exp?: number }).exp;
    return {
      ok: true,
      data: {
        header,
        payload,
        signature: parts[2],
        expIn: typeof exp === 'number' ? exp - Math.floor(Date.now() / 1000) : undefined,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Decode failed' };
  }
}

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export default function JwtDecode() {
  const [input, setInput] = useState(SAMPLE);

  useEffect(() => {
    const v = consumeSmartPaste('jwt-decode');
    if (v) setInput(v);
  }, []);

  const result = useMemo(() => decode(input), [input]);

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
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="Paste a JWT…"
          className="textarea font-mono text-xs break-all"
        />
        {result.ok ? (
          <SplitPane
            leftLabel="Header"
            rightLabel="Payload"
            left={
              <OutputPane
                text={JSON.stringify(result.data.header, null, 2)}
                copyLabel="Copy header JSON"
              />
            }
            right={
              <OutputPane
                text={JSON.stringify(result.data.payload, null, 2)}
                copyLabel="Copy payload JSON"
              />
            }
          />
        ) : (
          <OutputPane text={result.error} wrap tone="error" />
        )}
        {result.ok && result.data.expIn !== undefined ? (
          <p className="text-xs text-muted">
            {result.data.expIn > 0
              ? `Token expires in ${formatDuration(result.data.expIn)}.`
              : `Token expired ${formatDuration(-result.data.expIn)} ago.`}
          </p>
        ) : null}
        <InsightPanel
          toolSlug={tool.slug}
          input={input}
          output={result.ok ? result.data : null}
        />
      </div>
    </ToolFrame>
  );
}

function formatDuration(seconds: number): string {
  const s = Math.abs(seconds);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}
