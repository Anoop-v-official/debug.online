import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['list-converter']!;

type Format = 'newline' | 'comma' | 'space' | 'pipe' | 'json' | 'sql';

function split(s: string): string[] {
  if (!s.trim()) return [];
  if (s.trim().startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map(String);
    } catch {
      /* fall through */
    }
  }
  return s
    .split(/[\n,;|\t]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function join(items: string[], format: Format, options: { unique: boolean; sort: 'none' | 'asc' | 'desc'; trim: boolean }): string {
  let xs = items.slice();
  if (options.trim) xs = xs.map((x) => x.trim());
  if (options.unique) xs = Array.from(new Set(xs));
  if (options.sort === 'asc') xs.sort();
  if (options.sort === 'desc') xs.sort().reverse();
  switch (format) {
    case 'newline': return xs.join('\n');
    case 'comma':   return xs.join(', ');
    case 'space':   return xs.join(' ');
    case 'pipe':    return xs.join(' | ');
    case 'json':    return JSON.stringify(xs, null, 2);
    case 'sql':     return xs.map((x) => `'${x.replace(/'/g, "''")}'`).join(', ');
  }
}

const SAMPLE = `apple
banana
cherry
banana
date`;

export default function ListConverter() {
  const [input, setInput] = useState(SAMPLE);
  const [format, setFormat] = useState<Format>('comma');
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [trim, setTrim] = useState(true);

  const output = useMemo(() => join(split(input), format, { unique, sort, trim }), [input, format, unique, sort, trim]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, format, unique, sort, trim }),
        applyState: (s) => {
          const v = s as Partial<{ input: string; format: Format; unique: boolean; sort: typeof sort; trim: boolean }>;
          if (typeof v.input === 'string') setInput(v.input);
          if (v.format) setFormat(v.format);
          if (typeof v.unique === 'boolean') setUnique(v.unique);
          if (v.sort === 'none' || v.sort === 'asc' || v.sort === 'desc') setSort(v.sort);
          if (typeof v.trim === 'boolean') setTrim(v.trim);
        },
      }}
      actions={
        <>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="input w-auto py-1.5"
            aria-label="Output format"
          >
            <option value="newline">Newline</option>
            <option value="comma">Comma-separated</option>
            <option value="space">Space-separated</option>
            <option value="pipe">Pipe-separated</option>
            <option value="json">JSON array</option>
            <option value="sql">SQL IN list</option>
          </select>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="accent-accent" />
            Unique
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="accent-accent" />
            Trim items
          </label>
          <label className="flex items-center gap-2">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input w-auto py-1">
              <option value="none">none</option>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </label>
        </div>
        <SplitPane
          leftLabel="Input (any separator)"
          rightLabel={`Output · ${format}`}
          left={
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              spellCheck={false}
              className="textarea font-mono text-xs"
            />
          }
          right={<OutputPane text={output} wrap copyLabel="Copy list" />}
        />
        <p className="text-2xs text-subtle font-mono">
          Auto-splits on newlines, commas, semicolons, pipes, and tabs. JSON arrays in input are preserved as-is.
        </p>
      </div>
    </ToolFrame>
  );
}
