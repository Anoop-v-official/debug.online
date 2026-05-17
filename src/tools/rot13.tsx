import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['rot13']!;

function shift(input: string, n: number): string {
  const mod = ((n % 26) + 26) % 26;
  return input.replace(/[A-Za-z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + mod) % 26) + base);
  });
}

export default function Rot13() {
  const [input, setInput] = useState(
    'The quick brown fox jumps over the lazy dog.',
  );
  const [n, setN] = useState(13);

  const output = useMemo(() => shift(input, n), [input, n]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, n }),
        applyState: (s) => {
          const v = s as { input?: string; n?: number };
          if (typeof v.input === 'string') setInput(v.input);
          if (typeof v.n === 'number') setN(v.n);
        },
      }}
      actions={
        <label className="text-xs text-muted flex items-center gap-2">
          Shift
          <input
            type="number"
            value={n}
            min={1}
            max={25}
            onChange={(e) => setN(Number(e.target.value) || 13)}
            className="input w-20"
          />
        </label>
      }
    >
      <SplitPane
        leftLabel="Input"
        rightLabel={`Shifted by ${n} (Caesar)`}
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea"
          />
        }
        right={<OutputPane text={output} wrap copyLabel="Copy result" />}
      />
      <p className="mt-3 text-2xs text-subtle font-mono">
        Pure letter rotation — non-letters pass through unchanged. With shift 13, the same operation encodes and decodes (ROT13 is its own inverse).
      </p>
    </ToolFrame>
  );
}
