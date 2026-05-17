import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['math-evaluator']!;

const ALLOWED_NAMES = new Set([
  'sin','cos','tan','asin','acos','atan','atan2',
  'sqrt','cbrt','abs','ceil','floor','round','trunc','sign',
  'exp','log','log2','log10','pow','hypot',
  'min','max','random',
  'PI','E','LN2','LN10','LOG2E','LOG10E','SQRT2','SQRT1_2',
]);

const TOKEN_PATTERN = /[A-Za-z_][A-Za-z0-9_]*/g;

interface OK { ok: true; value: number; pretty: string }
interface Err { ok: false; error: string }

function evaluate(expr: string): OK | Err {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: false, error: 'Empty expression.' };

  // Allowlist check: every identifier must be in ALLOWED_NAMES
  const identifiers = trimmed.match(TOKEN_PATTERN) ?? [];
  for (const id of identifiers) {
    if (!ALLOWED_NAMES.has(id)) {
      return { ok: false, error: `Unknown name "${id}". Allowed: ${[...ALLOWED_NAMES].slice(0, 8).join(', ')}, …` };
    }
  }

  // Reject anything that isn't an expression character
  if (/[;{}\[\]`'"\\]/.test(trimmed)) {
    return { ok: false, error: 'Only arithmetic expressions are allowed.' };
  }

  // Replace identifiers with Math.<id>
  const exposed = trimmed.replace(TOKEN_PATTERN, (m) => `Math.${m}`);

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${exposed});`);
    const v = fn();
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return { ok: false, error: 'Result is not a finite number.' };
    }
    return { ok: true, value: v, pretty: formatNumber(v) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'evaluation failed' };
  }
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const abs = Math.abs(n);
  if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) return n.toExponential(6);
  return n.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

const PRESETS = [
  '2 + 2 * 3',
  '(1 + sqrt(5)) / 2',
  'sin(PI / 4)',
  'log(1024) / log(2)',
  'pow(2, 32) - 1',
  '60 * 60 * 24',
];

export default function MathEvaluator() {
  const [input, setInput] = useState('(1 + sqrt(5)) / 2');
  const result = useMemo(() => evaluate(input), [input]);

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
          className="input font-mono text-base"
          spellCheck={false}
          placeholder="2 + 2 * 3"
          autoFocus
        />

        {result.ok ? (
          <div className="card p-5 text-center">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              Result
            </div>
            <div className="font-display text-4xl font-semibold text-accent break-all">
              {result.pretty}
            </div>
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">{result.error}</pre>
        )}

        {result.ok ? (
          <OutputPane text={String(result.value)} wrap copyLabel="Copy result" />
        ) : null}

        <div>
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
            Try
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setInput(p)}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-surface border border-border text-muted hover:text-text hover:border-border-strong transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-2xs text-subtle font-mono">
          Supports `+ - * / %` and parentheses, plus the standard JS `Math` functions:
          sqrt, cbrt, pow, log, log2, log10, exp, sin, cos, tan, abs, floor, ceil, round, min, max, hypot,
          and constants PI, E, LN2, etc. Identifier allowlist prevents script execution.
        </p>
      </div>
    </ToolFrame>
  );
}
