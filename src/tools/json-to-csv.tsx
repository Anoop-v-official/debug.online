import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['json-to-csv']!;

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

function quote(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[], delim: string, doFlatten: boolean): string {
  if (rows.length === 0) return '';
  const prepared = doFlatten ? rows.map((r) => flatten(r)) : rows;
  const cols = Array.from(new Set(prepared.flatMap((r) => Object.keys(r))));
  const header = cols.join(delim);
  const body = prepared
    .map((r) => cols.map((c) => quote(r[c])).join(delim))
    .join('\n');
  return header + '\n' + body;
}

const SAMPLE = `[
  { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "active": true },
  { "id": 2, "name": "Grace Hopper", "email": "grace@example.com", "active": true },
  { "id": 3, "name": "Linus Torvalds", "email": "linus@example.com", "active": false }
]`;

export default function JsonToCsv() {
  const [input, setInput] = useState(SAMPLE);
  const [delim, setDelim] = useState<',' | ';' | '\t' | '|'>(',');
  const [flat, setFlat] = useState(true);

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        return { ok: false as const, error: 'Top-level value must be an array of objects.' };
      }
      const rows = parsed as Record<string, unknown>[];
      if (rows.some((r) => r === null || typeof r !== 'object' || Array.isArray(r))) {
        return { ok: false as const, error: 'Every array element must be an object.' };
      }
      return { ok: true as const, text: toCsv(rows, delim, flat) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'invalid JSON' };
    }
  }, [input, delim, flat]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, delim, flat }),
        applyState: (s) => {
          const v = s as { input?: string; delim?: typeof delim; flat?: boolean };
          if (typeof v.input === 'string') setInput(v.input);
          if (v.delim === ',' || v.delim === ';' || v.delim === '\t' || v.delim === '|') setDelim(v.delim);
          if (typeof v.flat === 'boolean') setFlat(v.flat);
        },
      }}
      actions={
        <>
          <select
            value={delim}
            onChange={(e) => setDelim(e.target.value as typeof delim)}
            className="input w-auto py-1.5"
            aria-label="Delimiter"
          >
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value={'\t'}>Tab</option>
            <option value="|">Pipe</option>
          </select>
          <label className="text-xs text-muted flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={flat}
              onChange={(e) => setFlat(e.target.checked)}
              className="accent-accent"
            />
            Flatten nested
          </label>
        </>
      }
    >
      <SplitPane
        leftLabel="JSON (array of objects)"
        rightLabel={result.ok ? 'CSV' : 'Error'}
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            className="textarea font-mono text-xs"
          />
        }
        right={
          result.ok ? (
            <OutputPane text={result.text} copyLabel="Copy CSV" />
          ) : (
            <OutputPane text={result.error} wrap tone="error" />
          )
        }
      />
    </ToolFrame>
  );
}
