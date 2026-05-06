import { useEffect, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['hash-generator']!;

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algo = (typeof ALGOS)[number];

async function hash(algo: Algo, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState('hello, world');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [out, setOut] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setOut('');
      return;
    }
    hash(algo, input).then((h) => {
      if (!cancelled) setOut(h);
    });
    return () => {
      cancelled = true;
    };
  }, [input, algo]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, algo }),
        applyState: (s) => {
          const v = s as { input?: string; algo?: Algo };
          if (typeof v.input === 'string') setInput(v.input);
          if (v.algo && (ALGOS as readonly string[]).includes(v.algo)) setAlgo(v.algo);
        },
      }}
      actions={
        <>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
            className="input w-auto py-1.5"
            aria-label="Algorithm"
          >
            {ALGOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <CopyButton text={out} />
        </>
      }
    >
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          spellCheck={false}
          className="textarea"
        />
        <OutputPane text={out} wrap copyLabel="Copy hash">
          {out || <span className="text-subtle">Hash appears here.</span>}
        </OutputPane>
      </div>
    </ToolFrame>
  );
}
