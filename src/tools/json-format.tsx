import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';
import { utf8ByteSize, formatBytes } from '../lib/byteSize';

const tool = toolBySlug['json-format']!;

const SAMPLE = `{"id":42,"user":{"name":"Ada","admin":true},"tags":["a","b"]}`;

export default function JsonFormat() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState<2 | 4 | 0>(2);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true, text: '' };
    try {
      const parsed = JSON.parse(input);
      const text =
        indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      return { ok: true as const, text };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : 'Invalid JSON',
      };
    }
  }, [input, indent]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value) as 0 | 2 | 4)}
            className="input w-auto py-1.5"
            aria-label="Indent"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>Minified</option>
          </select>
          <CopyButton text={result.ok ? result.text : ''} />
        </>
      }
    >
      <SplitPane
        leftLabel="Input"
        rightLabel={
          result.ok
            ? `Output · ${formatBytes(utf8ByteSize(result.text))}`
            : 'Error'
        }
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            rows={16}
            className="textarea"
            placeholder="Paste JSON here…"
          />
        }
        right={
          result.ok ? (
            <pre className="card p-3 text-xs font-mono overflow-auto h-[368px] whitespace-pre">
              {result.text || (
                <span className="text-subtle">Output will appear here.</span>
              )}
            </pre>
          ) : (
            <pre className="card p-3 text-xs font-mono text-error overflow-auto h-[368px] whitespace-pre-wrap">
              {result.error}
            </pre>
          )
        }
      />
      <div className="mt-4">
        <InsightPanel
          toolSlug={tool.slug}
          input={input}
          output={result.ok ? result.text : null}
        />
      </div>
    </ToolFrame>
  );
}
