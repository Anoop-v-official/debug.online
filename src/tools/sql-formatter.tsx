import { useMemo, useState } from 'react';
import { format as sqlFormat } from 'sql-formatter';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['sql-formatter']!;

const DIALECTS = [
  'sql',
  'mysql',
  'mariadb',
  'postgresql',
  'sqlite',
  'tsql',
  'bigquery',
  'snowflake',
  'redshift',
] as const;
type Dialect = (typeof DIALECTS)[number];

const SAMPLE = `select u.id,u.email,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.created_at > '2024-01-01' group by u.id,u.email order by orders desc limit 50;`;

export default function SqlFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [dialect, setDialect] = useState<Dialect>('postgresql');
  const [tab, setTab] = useState(2);
  const [uppercase, setUppercase] = useState(true);

  const result = useMemo(() => {
    try {
      const text = sqlFormat(input, {
        language: dialect,
        tabWidth: tab,
        keywordCase: uppercase ? 'upper' : 'preserve',
      });
      return { ok: true as const, text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'format failed' };
    }
  }, [input, dialect, tab, uppercase]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="input w-auto py-1.5"
            aria-label="Dialect"
          >
            {DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <CopyButton text={result.ok ? result.text : ''} />
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-muted flex items-center gap-2">
            Tab
            <input
              type="number"
              min={1}
              max={8}
              value={tab}
              onChange={(e) => setTab(Number(e.target.value) || 2)}
              className="input w-16 py-1.5"
            />
          </label>
          <label className="text-xs text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="accent-accent"
            />
            UPPERCASE keywords
          </label>
        </div>

        <SplitPane
          leftLabel="Input SQL"
          rightLabel={result.ok ? 'Formatted' : 'Error'}
          left={
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              spellCheck={false}
              className="textarea font-mono text-xs"
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
      </div>
    </ToolFrame>
  );
}
