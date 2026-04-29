import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['env-diff']!;

function parse(env: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const raw of env.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out.set(k, v);
  }
  return out;
}

const SAMPLE_A = `DATABASE_URL=postgres://localhost/app
NODE_ENV=development
API_KEY=abc123
LOG_LEVEL=debug`;

const SAMPLE_B = `DATABASE_URL=postgres://prod.example.com/app
NODE_ENV=production
API_KEY=zzz999
SENTRY_DSN=https://sentry.example.com
PORT=3000`;

export default function EnvDiff() {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);

  const { added, removed, changed, same } = useMemo(() => {
    const ma = parse(a);
    const mb = parse(b);
    const added: string[] = [];
    const removed: string[] = [];
    const changed: { key: string; from: string; to: string }[] = [];
    const same: string[] = [];
    for (const [k, v] of mb) {
      if (!ma.has(k)) added.push(k);
      else if (ma.get(k) !== v) changed.push({ key: k, from: ma.get(k) ?? '', to: v });
      else same.push(k);
    }
    for (const [k] of ma) {
      if (!mb.has(k)) removed.push(k);
    }
    return { added, removed, changed, same };
  }, [a, b]);

  return (
    <ToolFrame tool={tool}>
      <SplitPane
        leftLabel="A"
        rightLabel="B"
        left={
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea"
          />
        }
        right={
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea"
          />
        }
      />
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <Section title={`Missing in B (${removed.length})`} color="text-error">
          {removed.map((k) => (
            <li key={k}>{k}</li>
          ))}
          {removed.length === 0 && <li className="text-subtle">none</li>}
        </Section>
        <Section title={`Added in B (${added.length})`} color="text-accent">
          {added.map((k) => (
            <li key={k}>{k}</li>
          ))}
          {added.length === 0 && <li className="text-subtle">none</li>}
        </Section>
        <Section title={`Changed values (${changed.length})`} color="text-warning">
          {changed.map((c) => (
            <li key={c.key}>
              {c.key}:{' '}
              <span className="text-error">{c.from || '∅'}</span> →{' '}
              <span className="text-accent">{c.to || '∅'}</span>
            </li>
          ))}
          {changed.length === 0 && <li className="text-subtle">none</li>}
        </Section>
        <Section title={`Identical (${same.length})`} color="text-muted">
          <li className="text-subtle">{same.length} keys match</li>
        </Section>
      </div>
    </ToolFrame>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-3">
      <div className={`text-2xs uppercase tracking-wide font-mono mb-2 ${color}`}>
        {title}
      </div>
      <ul className="font-mono text-xs space-y-1 break-all">{children}</ul>
    </div>
  );
}
