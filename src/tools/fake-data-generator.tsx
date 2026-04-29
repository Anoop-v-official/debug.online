import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['fake-data-generator']!;

const FIRST = ['Ada','Grace','Linus','Margaret','Donald','Barbara','Ken','Alan','Hedy','Tim','Rosa','Quincy','Tova','Marvin','Radia','Jeff','Sundar','Diana','Hari','Mira'];
const LAST = ['Lovelace','Hopper','Torvalds','Hamilton','Knuth','Liskov','Thompson','Turing','Lamarr','Berners-Lee','Carlsson','Adams','Holberton','Minsky','Perlman','Bezos','Pichai','Greene','Sreenivasan','Murati'];
const DOMAINS = ['example.com','testmail.io','dev.local','company.dev','startup.tech','enterprise.co','sandbox.com'];
const STREETS = ['Maple St','Oak Ave','Pine Rd','Cedar Ln','Birch Blvd','Elm St','Ash Way','Walnut Dr','Sequoia Pl'];
const CITIES = ['Springfield','Riverside','Franklin','Greenville','Bristol','Clinton','Madison','Salem','Georgetown','Arlington'];
const STATES = ['CA','NY','TX','FL','WA','MA','IL','CO','GA','OR'];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Row {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  ip: string;
  cardLast4: string;
}

function row(): Row {
  const first = rand(FIRST);
  const last = rand(LAST);
  const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '');
  return {
    id: crypto.randomUUID(),
    firstName: first,
    lastName: last,
    email: `${handle}+${randInt(1, 9999)}@${rand(DOMAINS)}`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    street: `${randInt(10, 9999)} ${rand(STREETS)}`,
    city: rand(CITIES),
    state: rand(STATES),
    zip: String(randInt(10000, 99999)),
    ip: `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}`,
    cardLast4: String(randInt(1000, 9999)),
  };
}

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return '';
  const cols = Object.keys(rows[0]) as (keyof Row)[];
  const header = cols.join(',');
  const body = rows
    .map((r) => cols.map((c) => JSON.stringify(r[c])).join(','))
    .join('\n');
  return header + '\n' + body;
}

export default function FakeDataGenerator() {
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(0);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const rows = useMemo(() => Array.from({ length: count }, row), [count, seed]);
  const text = format === 'json' ? JSON.stringify(rows, null, 2) : toCsv(rows);

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
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
            className="input w-auto py-1.5"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          <button type="button" className="btn" onClick={() => setSeed((n) => n + 1)}>
            Regenerate
          </button>
          <CopyButton text={text} />
        </>
      }
    >
      <pre className="pane text-xs">{text}</pre>
      <p className="text-2xs text-subtle font-mono mt-3">
        Realistic-looking but synthetic data for testing. No real credit card numbers — `cardLast4` is purely random digits.
      </p>
    </ToolFrame>
  );
}
