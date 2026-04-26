import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['uuid-generator']!;

function genMany(n: number): string[] {
  return Array.from({ length: n }, () => crypto.randomUUID());
}

export default function UuidGenerator() {
  const [count, setCount] = useState(8);
  const [list, setList] = useState<string[]>(() => genMany(8));

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
            }
            className="input w-20 py-1.5"
            aria-label="Count"
          />
          <button type="button" className="btn-accent" onClick={() => setList(genMany(count))}>
            Generate
          </button>
          <CopyButton text={list.join('\n')} label="Copy all" />
        </>
      }
    >
      <pre className="pane">{list.join('\n')}</pre>
    </ToolFrame>
  );
}
