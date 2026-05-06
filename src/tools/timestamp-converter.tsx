import { useEffect, useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { consumeSmartPaste } from '../lib/smartPaste';

const tool = toolBySlug['timestamp-converter']!;

function parseInput(s: string): Date | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    const ms = trimmed.length <= 10 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverter() {
  const [input, setInput] = useState(String(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const v = consumeSmartPaste('timestamp-converter');
    if (v) setInput(v);
  }, []);

  const date = useMemo(() => parseInput(input), [input]);

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
      actions={
        <button
          type="button"
          className="btn"
          onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
        >
          Now
        </button>
      }
    >
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          placeholder="Unix seconds, ms, or any date string"
          spellCheck={false}
        />
        {date ? (
          <div className="card p-3 text-sm font-mono space-y-1.5">
            <Row label="Unix s" value={String(Math.floor(date.getTime() / 1000))} />
            <Row label="Unix ms" value={String(date.getTime())} />
            <Row label="ISO" value={date.toISOString()} />
            <Row label="UTC" value={date.toUTCString()} />
            <Row label="Local" value={date.toString()} />
            <Row
              label="Relative"
              value={relative(date.getTime() - Date.now())}
            />
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">
            Could not parse that input.
          </pre>
        )}
      </div>
    </ToolFrame>
  );
}

function relative(diffMs: number): string {
  const s = Math.round(diffMs / 1000);
  const a = Math.abs(s);
  const fmt =
    a < 60 ? `${a}s` : a < 3600 ? `${Math.round(a / 60)}m` : a < 86400 ? `${Math.round(a / 3600)}h` : `${Math.round(a / 86400)}d`;
  return s > 0 ? `in ${fmt}` : `${fmt} ago`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-16">{label}</span>
      <span className="text-text break-all text-right">{value}</span>
    </div>
  );
}
