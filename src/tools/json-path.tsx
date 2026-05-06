import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['json-path']!;

type JV = unknown;

/**
 * Minimal JSONPath query implementation supporting:
 *   $              — root
 *   .field         — child field (also ['field'])
 *   [n]            — array index, supports negatives (-1 last)
 *   [a:b]          — slice
 *   [*]            — wildcard for any array element / any object value
 *   ..             — recursive descent (limited to property name following)
 */
function tokenize(path: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < path.length) {
    const c = path[i];
    if (c === '$') {
      tokens.push('$');
      i++;
    } else if (c === '.') {
      if (path[i + 1] === '.') {
        tokens.push('..');
        i += 2;
      } else {
        i++;
      }
    } else if (c === '[') {
      const end = path.indexOf(']', i);
      if (end === -1) throw new Error('Unclosed [');
      tokens.push('[' + path.slice(i + 1, end) + ']');
      i = end + 1;
    } else {
      // Read identifier
      let j = i;
      while (
        j < path.length &&
        path[j] !== '.' &&
        path[j] !== '[' &&
        path[j] !== ']'
      ) {
        j++;
      }
      const name = path.slice(i, j);
      if (name) tokens.push(name);
      i = j;
    }
  }
  return tokens;
}

function applyToken(values: JV[], tok: string, recursive = false): JV[] {
  if (tok.startsWith('[') && tok.endsWith(']')) {
    const inside = tok.slice(1, -1).trim();
    if (inside === '*') {
      return values.flatMap((v) => {
        if (Array.isArray(v)) return v;
        if (v && typeof v === 'object') return Object.values(v);
        return [];
      });
    }
    if (inside.startsWith("'") && inside.endsWith("'")) {
      const key = inside.slice(1, -1);
      return values.map((v) => (v && typeof v === 'object' ? (v as Record<string, JV>)[key] : undefined));
    }
    if (inside.includes(':')) {
      const [a, b] = inside.split(':').map((s) => (s.trim() === '' ? undefined : Number(s)));
      return values.flatMap((v) => {
        if (!Array.isArray(v)) return [];
        return v.slice(a, b);
      });
    }
    const idx = Number(inside);
    if (!Number.isInteger(idx)) throw new Error(`Invalid index: ${inside}`);
    return values.flatMap((v) => {
      if (!Array.isArray(v)) return [];
      const i = idx < 0 ? v.length + idx : idx;
      return [v[i]];
    });
  }
  if (recursive) {
    const out: JV[] = [];
    function walk(v: JV) {
      if (v && typeof v === 'object') {
        if (Array.isArray(v)) v.forEach(walk);
        else {
          const obj = v as Record<string, JV>;
          if (tok in obj) out.push(obj[tok]);
          Object.values(obj).forEach(walk);
        }
      }
    }
    values.forEach(walk);
    return out;
  }
  return values.map((v) =>
    v && typeof v === 'object' ? (v as Record<string, JV>)[tok] : undefined,
  );
}

function query(data: JV, path: string): JV[] {
  const tokens = tokenize(path);
  if (tokens[0] !== '$') throw new Error('Path must start with $');
  let current: JV[] = [data];
  let recursive = false;
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '..') {
      recursive = true;
      continue;
    }
    current = applyToken(current, t, recursive);
    recursive = false;
  }
  return current.filter((v) => v !== undefined);
}

const SAMPLE_JSON = `{
  "store": {
    "books": [
      { "title": "The Pragmatic Programmer", "author": "Hunt", "price": 29.99 },
      { "title": "Clean Code", "author": "Martin", "price": 32.50 },
      { "title": "Refactoring", "author": "Fowler", "price": 39.95 }
    ],
    "bicycle": { "color": "green", "price": 199.99 }
  }
}`;

export default function JsonPath() {
  const [json, setJson] = useState(SAMPLE_JSON);
  const [path, setPath] = useState('$.store.books[*].title');

  const result = useMemo(() => {
    let parsed: JV;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'invalid JSON' };
    }
    try {
      const out = query(parsed, path);
      return { ok: true as const, value: out };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'invalid path' };
    }
  }, [json, path]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ json, path }),
        applyState: (s) => {
          const v = s as { json?: string; path?: string };
          if (typeof v.json === 'string') setJson(v.json);
          if (typeof v.path === 'string') setPath(v.path);
        },
      }}
      actions={
        <CopyButton text={result.ok ? JSON.stringify(result.value, null, 2) : ''} />
      }
    >
      <div className="space-y-4">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="input font-mono"
          placeholder="$.store.books[*].title"
          spellCheck={false}
        />

        <SplitPane
          leftLabel="JSON"
          rightLabel={result.ok ? `Match · ${result.value.length}` : 'Error'}
          left={
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={16}
              spellCheck={false}
              className="textarea font-mono text-xs"
            />
          }
          right={
            result.ok ? (
              <pre className="pane">{JSON.stringify(result.value, null, 2)}</pre>
            ) : (
              <pre className="pane-wrap text-error">{result.error}</pre>
            )
          }
        />

        <p className="text-2xs text-subtle font-mono">
          Supports <code className="text-text">$</code>, <code className="text-text">.field</code>,{' '}
          <code className="text-text">[n]</code> (and negative indices),{' '}
          <code className="text-text">[a:b]</code>, <code className="text-text">[*]</code>, and{' '}
          <code className="text-text">..field</code> recursive descent. Filters and script expressions are not supported.
        </p>
      </div>
    </ToolFrame>
  );
}
