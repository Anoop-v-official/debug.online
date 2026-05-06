import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['yaml-validator']!;

const SAMPLE = `apiVersion: v1
kind: Service
metadata:
  name: hello
  labels:
    app: hello
spec:
  selector:
    app: hello
  ports:
    - port: 80
      targetPort: 8080
`;

export default function YamlValidator() {
  const [input, setInput] = useState(SAMPLE);
  const [out, setOut] = useState<'json' | 'yaml'>('json');

  const result = useMemo(() => {
    try {
      const parsed = yaml.load(input);
      const text =
        out === 'json'
          ? JSON.stringify(parsed, null, 2)
          : yaml.dump(parsed, { indent: 2, lineWidth: 100 });
      return { ok: true as const, text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'parse failed';
      return { ok: false as const, error: msg };
    }
  }, [input, out]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, out }),
        applyState: (s) => {
          const v = s as { input?: string; out?: 'json' | 'yaml' };
          if (typeof v.input === 'string') setInput(v.input);
          if (v.out === 'json' || v.out === 'yaml') setOut(v.out);
        },
      }}
      actions={
        <>
          <select
            value={out}
            onChange={(e) => setOut(e.target.value as 'json' | 'yaml')}
            className="input w-auto py-1.5"
            aria-label="Output format"
          >
            <option value="json">→ JSON</option>
            <option value="yaml">→ YAML (re-formatted)</option>
          </select>
          <CopyButton text={result.ok ? result.text : ''} />
        </>
      }
    >
      <SplitPane
        leftLabel="YAML"
        rightLabel={result.ok ? 'Output' : 'Error'}
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
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
    </ToolFrame>
  );
}
