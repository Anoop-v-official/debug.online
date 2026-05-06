import { useEffect, useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { InsightPanel } from '../components/InsightPanel';
import { toolBySlug } from '../lib/tools';
import { utf8ByteSize, formatBytes } from '../lib/byteSize';
import { consumeSmartPaste } from '../lib/smartPaste';

const tool = toolBySlug['json-format']!;

const SAMPLE = `{"id":42,"user":{"name":"Ada","admin":true},"tags":["a","b"]}`;

export default function JsonFormat() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState<2 | 4 | 0>(2);

  useEffect(() => {
    const v = consumeSmartPaste('json-format');
    if (v) setInput(v);
  }, []);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, text: '' };
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
      share={{
        getState: () => ({ input, indent }),
        applyState: (s) => {
          const v = s as { input?: string; indent?: 0 | 2 | 4 };
          if (typeof v.input === 'string') setInput(v.input);
          if (v.indent === 0 || v.indent === 2 || v.indent === 4) setIndent(v.indent);
        },
      }}
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
            <OutputPane text={result.text} copyLabel="Copy output">
              {result.text || (
                <span className="text-subtle">Output appears here.</span>
              )}
            </OutputPane>
          ) : (
            <OutputPane text={result.error} wrap tone="error" />
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
