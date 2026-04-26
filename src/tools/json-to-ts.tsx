import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['json-to-ts']!;

type JV = unknown;

function pascal(s: string): string {
  return s.replace(/(^|[_\s-])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/\W/g, '');
}

function isIdent(k: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);
}

function infer(value: JV, name: string, out: string[]): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const inner = unionTypes(value.map((v) => infer(v, name, out)));
    return `${inner}[]`;
  }
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object': {
      const obj = value as Record<string, JV>;
      const keys = Object.keys(obj);
      if (keys.length === 0) return 'Record<string, unknown>';
      const lines = keys.map((k) => {
        const t = infer(obj[k], pascal(k), out);
        const safeKey = isIdent(k) ? k : JSON.stringify(k);
        return `  ${safeKey}: ${t};`;
      });
      const iface = `export interface ${name} {\n${lines.join('\n')}\n}`;
      out.push(iface);
      return name;
    }
    default:
      return 'unknown';
  }
}

function unionTypes(types: string[]): string {
  const set = Array.from(new Set(types));
  if (set.length === 1) return set[0];
  return `(${set.join(' | ')})`;
}

function generate(json: string, root: string): { ok: true; text: string } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    const out: string[] = [];
    const rootType = infer(parsed, pascal(root) || 'Root', out);
    if (out.length === 0) {
      return { ok: true, text: `export type ${pascal(root) || 'Root'} = ${rootType};` };
    }
    return { ok: true, text: out.reverse().join('\n\n') };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'invalid JSON' };
  }
}

const SAMPLE = `{
  "id": 42,
  "user": { "name": "Ada", "admin": true },
  "tags": ["a", "b"],
  "scores": [1, 2.5, null]
}`;

export default function JsonToTs() {
  const [input, setInput] = useState(SAMPLE);
  const [name, setName] = useState('Root');
  const result = useMemo(() => generate(input, name), [input, name]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-32 py-1.5"
            placeholder="Root name"
            aria-label="Root type name"
          />
          <CopyButton text={result.ok ? result.text : ''} />
        </>
      }
    >
      <SplitPane
        leftLabel="JSON"
        rightLabel="TypeScript"
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            className="textarea"
          />
        }
        right={
          result.ok ? (
            <pre className="pane">{result.text}</pre>
          ) : (
            <pre className="pane-wrap text-error">{result.error}</pre>
          )
        }
      />
    </ToolFrame>
  );
}
