import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['lorem-ipsum']!;

const WORDS = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum`.split(
  /\s+/,
);

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function sentence(): string {
  const len = 6 + Math.floor(Math.random() * 12);
  const words = Array.from({ length: len }, pickWord);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function paragraph(): string {
  const n = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: n }, sentence).join(' ');
}

function generate(unit: 'words' | 'sentences' | 'paragraphs', count: number): string {
  if (unit === 'words') return Array.from({ length: count }, pickWord).join(' ');
  if (unit === 'sentences') return Array.from({ length: count }, sentence).join(' ');
  return Array.from({ length: count }, paragraph).join('\n\n');
}

export default function LoremIpsum() {
  const [unit, setUnit] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs');
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0);
  const text = useMemo(() => generate(unit, count), [unit, count, seed]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as typeof unit)}
            className="input w-auto py-1.5"
            aria-label="Unit"
          >
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </select>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
            }
            className="input w-20 py-1.5"
            aria-label="Count"
          />
          <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
            Regenerate
          </button>
          <CopyButton text={text} />
        </>
      }
    >
      <pre className="card p-3 text-sm font-sans whitespace-pre-wrap leading-relaxed">
        {text}
      </pre>
    </ToolFrame>
  );
}
