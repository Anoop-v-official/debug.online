import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['json-to-yaml']!;

const SAMPLE = `{
  "apiVersion": "v1",
  "kind": "Service",
  "metadata": { "name": "hello", "labels": { "app": "hello" } },
  "spec": {
    "selector": { "app": "hello" },
    "ports": [{ "port": 80, "targetPort": 8080 }]
  }
}`;

export default function JsonToYaml() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      const text = yaml.dump(parsed, { indent, lineWidth: 100, noRefs: true });
      return { ok: true as const, text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'invalid JSON' };
    }
  }, [input, indent]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, indent }),
        applyState: (s) => {
          const v = s as { input?: string; indent?: number };
          if (typeof v.input === 'string') setInput(v.input);
          if (typeof v.indent === 'number') setIndent(v.indent);
        },
      }}
      actions={
        <select
          value={indent}
          onChange={(e) => setIndent(Number(e.target.value))}
          className="input w-auto py-1.5"
          aria-label="Indent"
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      }
    >
      <SplitPane
        leftLabel="JSON"
        rightLabel={result.ok ? 'YAML' : 'Error'}
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
            <OutputPane text={result.text} copyLabel="Copy YAML" />
          ) : (
            <OutputPane text={result.error} wrap tone="error" />
          )
        }
      />
    </ToolFrame>
  );
}
