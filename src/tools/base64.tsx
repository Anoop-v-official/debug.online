import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['base64']!;

function encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function decode(input: string): string {
  const cleaned = input.replace(/\s+/g, '');
  const bin = atob(cleaned);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export default function Base64() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('hello, world');

  const output = useMemo(() => {
    if (!input) return { ok: true as const, text: '' };
    try {
      return { ok: true as const, text: mode === 'encode' ? encode(input) : decode(input) };
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
      share={{
        getState: () => ({ input, mode }),
        applyState: (s) => {
          const v = s as { input?: string; mode?: 'encode' | 'decode' };
          if (typeof v.input === 'string') setInput(v.input);
          if (v.mode === 'encode' || v.mode === 'decode') setMode(v.mode);
        },
      }}
      actions={
        <>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs ${mode === 'encode' ? 'bg-surface-2 text-text' : 'text-muted'}`}
              onClick={() => setMode('encode')}
            >
              Encode
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs ${mode === 'decode' ? 'bg-surface-2 text-text' : 'text-muted'}`}
              onClick={() => setMode('decode')}
            >
              Decode
            </button>
          </div>
          <CopyButton text={output.ok ? output.text : ''} />
        </>
      }
    >
      <SplitPane
        leftLabel={mode === 'encode' ? 'Plain text' : 'Base64'}
        rightLabel={mode === 'encode' ? 'Base64' : 'Plain text'}
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            spellCheck={false}
            className="textarea"
          />
        }
        right={
          output.ok ? (
            <OutputPane text={output.text} wrap copyLabel="Copy output">
              {output.text || <span className="text-subtle">Output appears here.</span>}
            </OutputPane>
          ) : (
            <OutputPane text={output.error} wrap tone="error" />
          )
        }
      />
    </ToolFrame>
  );
}
