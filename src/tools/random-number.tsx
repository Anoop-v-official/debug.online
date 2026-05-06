import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['random-number']!;

function genSecure(min: number, max: number, count: number, allowDup: boolean): number[] {
  const range = max - min + 1;
  if (!allowDup && count > range) {
    throw new Error(`Cannot generate ${count} unique numbers in [${min}, ${max}].`);
  }
  const out: number[] = [];
  const seen = new Set<number>();
  while (out.length < count) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const n = (buf[0] % range) + min;
    if (!allowDup) {
      if (seen.has(n)) continue;
      seen.add(n);
    }
    out.push(n);
  }
  return out;
}

export default function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [allowDup, setAllowDup] = useState(true);
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [result, setResult] = useState<number[]>([]);
  const [err, setErr] = useState<string | null>(null);

  function go() {
    setErr(null);
    if (min >= max) {
      setErr('Min must be less than max.');
      return;
    }
    try {
      let nums = genSecure(min, max, count, allowDup);
      if (sort === 'asc') nums = [...nums].sort((a, b) => a - b);
      else if (sort === 'desc') nums = [...nums].sort((a, b) => b - a);
      setResult(nums);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    }
  }

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <button type="button" className="btn-accent" onClick={go}>
            Generate
          </button>
          <CopyButton text={result.join(', ')} label="Copy" />
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm text-muted">
            Minimum
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="input mt-1 font-mono"
            />
          </label>
          <label className="text-sm text-muted">
            Maximum
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="input mt-1 font-mono"
            />
          </label>
          <label className="text-sm text-muted">
            How many
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              className="input mt-1 font-mono"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="text-xs text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowDup}
              onChange={(e) => setAllowDup(e.target.checked)}
              className="accent-accent"
            />
            Allow duplicates
          </label>
          <label className="text-xs text-muted flex items-center gap-2">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="input w-auto py-1.5"
            >
              <option value="none">None</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        {err ? <pre className="card p-3 text-xs font-mono text-error">{err}</pre> : null}

        {result.length > 0 ? (
          <pre className="pane-wrap font-mono">{result.join(', ')}</pre>
        ) : (
          <pre className="pane-wrap text-subtle">Click Generate to produce a list.</pre>
        )}

        <p className="text-2xs text-subtle font-mono">
          Uses crypto.getRandomValues — cryptographically secure, suitable for tokens, lottery picks, and seed values.
        </p>
      </div>
    </ToolFrame>
  );
}
