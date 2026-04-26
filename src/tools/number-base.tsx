import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['number-base']!;

const BASES: Array<{ label: string; base: number; prefix?: string }> = [
  { label: 'Binary', base: 2, prefix: '0b' },
  { label: 'Octal', base: 8, prefix: '0o' },
  { label: 'Decimal', base: 10 },
  { label: 'Hex', base: 16, prefix: '0x' },
];

function parseAuto(s: string): number | null {
  const t = s.trim().replace(/_/g, '').toLowerCase();
  if (!t) return null;
  let base = 10;
  let body = t;
  if (t.startsWith('0x')) {
    base = 16;
    body = t.slice(2);
  } else if (t.startsWith('0b')) {
    base = 2;
    body = t.slice(2);
  } else if (t.startsWith('0o')) {
    base = 8;
    body = t.slice(2);
  }
  const n = parseInt(body, base);
  return isNaN(n) ? null : n;
}

export default function NumberBase() {
  const [input, setInput] = useState('255');
  const value = useMemo(() => parseAuto(input), [input]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          spellCheck={false}
          placeholder="255 · 0xff · 0b11111111 · 0o377"
        />
        {value === null ? (
          <pre className="card p-3 text-xs font-mono text-error">
            Could not parse. Use decimal, 0x, 0b or 0o prefixes.
          </pre>
        ) : (
          <div className="card p-3 text-sm font-mono divide-y divide-border">
            {BASES.map(({ label, base, prefix }) => (
              <div key={base} className="flex items-center gap-3 py-1.5">
                <span className="text-subtle text-2xs uppercase tracking-wide w-20 shrink-0">
                  {label}
                </span>
                <span className="text-text break-all">
                  {prefix ?? ''}
                  {value.toString(base)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolFrame>
  );
}
