import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['regex-tester']!;

export default function RegexTester() {
  const [pattern, setPattern] = useState('\\b(\\w+)@(\\w+\\.\\w+)\\b');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState(
    'Email me at ada@example.com or grace@hopper.dev — both work.',
  );

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const matches: RegExpExecArray[] = [];
      if (flags.includes('g')) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push(m);
          if (m[0] === '') re.lastIndex++;
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push(m);
      }
      return { ok: true as const, matches };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : 'invalid regex',
      };
    }
  }, [pattern, flags, text]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-subtle">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="input flex-1"
            spellCheck={false}
          />
          <span className="text-subtle">/</span>
          <input
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
            className="input w-20"
            spellCheck={false}
          />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          spellCheck={false}
          className="textarea"
        />
        {result.ok ? (
          <div className="card p-3 text-xs font-mono space-y-1">
            <div className="text-subtle uppercase tracking-wide text-2xs mb-1">
              {result.matches.length} match{result.matches.length === 1 ? '' : 'es'}
            </div>
            {result.matches.length === 0 ? (
              <div className="text-subtle">No matches.</div>
            ) : (
              result.matches.map((m, i) => (
                <div key={i} className="border-b border-border last:border-0 py-1">
                  <span className="text-accent">{m[0]}</span>
                  {m.length > 1 ? (
                    <span className="text-muted">
                      {' '}
                      → groups: [{m.slice(1).map((g) => JSON.stringify(g)).join(', ')}]
                    </span>
                  ) : null}
                  <span className="text-subtle"> @ {m.index}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">{result.error}</pre>
        )}
      </div>
    </ToolFrame>
  );
}
