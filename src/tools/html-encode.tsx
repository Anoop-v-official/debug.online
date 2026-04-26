import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['html-encode']!;

const ENC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function encode(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ENC[c]!);
}

function decode(s: string): string {
  const el = document.createElement('div');
  el.innerHTML = s;
  return el.textContent ?? '';
}

export default function HtmlEncode() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState(`<a href="?q=1&x=2">tom & jerry</a>`);

  const output = useMemo(
    () => (mode === 'encode' ? encode(input) : decode(input)),
    [input, mode],
  );

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
          <CopyButton text={output} />
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
          <pre className="pane-wrap">
            {output || <span className="text-subtle">Output appears here.</span>}
          </pre>
        }
      />
    </ToolFrame>
  );
}
