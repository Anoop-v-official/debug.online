import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['url-encode']!;

export default function UrlEncode() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('hello world & friends');

  const output = useMemo(() => {
    try {
      return {
        ok: true as const,
        text: mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input),
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : 'failed',
      };
    }
  }, [input, mode]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
            className="input w-auto py-1.5"
            aria-label="Mode"
          >
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
          <CopyButton text={output.ok ? output.text : ''} />
        </>
      }
    >
      <SplitPane
        leftLabel="Input"
        rightLabel="Output"
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea"
          />
        }
        right={
          output.ok ? (
            <pre className="pane-wrap">
              {output.text || <span className="text-subtle">Output appears here.</span>}
            </pre>
          ) : (
            <pre className="pane-wrap text-error">{output.error}</pre>
          )
        }
      />
    </ToolFrame>
  );
}
