import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['roman-numerals']!;

const PAIRS: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return '';
  let out = '';
  let v = n;
  for (const [val, sym] of PAIRS) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out;
}

function fromRoman(s: string): number | null {
  const cleaned = s.toUpperCase().trim();
  if (!cleaned || !/^[MDCLXVI]+$/.test(cleaned)) return null;
  let total = 0;
  let i = 0;
  while (i < cleaned.length) {
    const two = cleaned.slice(i, i + 2);
    const one = cleaned[i];
    const pair = PAIRS.find(([, sym]) => sym === two);
    const single = PAIRS.find(([, sym]) => sym === one);
    if (pair) {
      total += pair[0];
      i += 2;
    } else if (single) {
      total += single[0];
      i += 1;
    } else {
      return null;
    }
  }
  // Sanity check: the round-trip should be identical
  if (toRoman(total) !== cleaned) return null;
  return total;
}

export default function RomanNumerals() {
  const [input, setInput] = useState('2026');

  const { roman, number, err } = useMemo(() => {
    const trimmed = input.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (n < 1 || n > 3999) {
        return { roman: '', number: null, err: 'Romans only support 1–3999.' };
      }
      return { roman: toRoman(n), number: n, err: null };
    }
    const n = fromRoman(trimmed);
    if (n === null) return { roman: '', number: null, err: 'Not a valid Roman numeral or integer.' };
    return { roman: trimmed.toUpperCase(), number: n, err: null };
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
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono text-lg"
          placeholder="2026 or MMXXVI"
          spellCheck={false}
        />

        {err ? (
          <pre className="card p-3 text-xs font-mono text-error">{err}</pre>
        ) : (
          <div className="card p-5 text-center space-y-2">
            <div className="font-display text-4xl font-semibold tracking-wider">{roman}</div>
            <div className="text-muted font-mono text-sm">= {number}</div>
          </div>
        )}

        {roman && !err ? (
          <OutputPane text={roman} wrap copyLabel="Copy Roman" />
        ) : null}

        <p className="text-2xs text-subtle font-mono">
          Standard subtractive notation. M=1000, D=500, C=100, L=50, X=10, V=5, I=1. Max value 3999 (MMMCMXCIX) — larger Romans existed but had no standard form.
        </p>
      </div>
    </ToolFrame>
  );
}
