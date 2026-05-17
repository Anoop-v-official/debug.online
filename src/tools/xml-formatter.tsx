import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['xml-formatter']!;

interface FormatOptions {
  indent: number;
  minify: boolean;
}

function format(xml: string, opts: FormatOptions): string {
  const trimmed = xml.trim();
  if (!trimmed) return '';

  if (opts.minify) {
    return trimmed.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  }

  const pad = ' '.repeat(opts.indent);
  // Split into tokens: tags and text between tags
  const tokens = trimmed.replace(/>\s+</g, '><').split(/(<[^>]+>)/g).filter(Boolean);

  const out: string[] = [];
  let depth = 0;
  for (const t of tokens) {
    if (t.startsWith('<')) {
      const isComment = t.startsWith('<!--');
      const isProcessing = t.startsWith('<?') || t.startsWith('<!');
      const isClosing = t.startsWith('</');
      const isSelfClosing = t.endsWith('/>') || isProcessing || isComment;
      if (isClosing) depth = Math.max(0, depth - 1);
      out.push(pad.repeat(depth) + t);
      if (!isClosing && !isSelfClosing) depth++;
    } else {
      const text = t.trim();
      if (text) out.push(pad.repeat(depth) + text);
    }
  }
  return out.join('\n');
}

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget the deploy on Friday.</body><tags><tag>work</tag><tag>urgent</tag></tags></note>`;

export default function XmlFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [minify, setMinify] = useState(false);

  const result = useMemo(() => {
    try {
      const text = format(input, { indent, minify });
      // Validate with DOMParser
      if (text) {
        const doc = new DOMParser().parseFromString(input, 'application/xml');
        const err = doc.querySelector('parsererror');
        if (err) {
          return { ok: false as const, error: err.textContent ?? 'XML parse error' };
        }
      }
      return { ok: true as const, text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'format failed' };
    }
  }, [input, indent, minify]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, indent, minify }),
        applyState: (s) => {
          const v = s as { input?: string; indent?: number; minify?: boolean };
          if (typeof v.input === 'string') setInput(v.input);
          if (typeof v.indent === 'number') setIndent(v.indent);
          if (typeof v.minify === 'boolean') setMinify(v.minify);
        },
      }}
      actions={
        <>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="input w-auto py-1.5"
            aria-label="Indent"
            disabled={minify}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
          <label className="text-xs text-muted flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={minify}
              onChange={(e) => setMinify(e.target.checked)}
              className="accent-accent"
            />
            Minify
          </label>
        </>
      }
    >
      <SplitPane
        leftLabel="Input"
        rightLabel={result.ok ? (minify ? 'Minified' : 'Formatted') : 'Error'}
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
            <OutputPane text={result.text} copyLabel="Copy XML" />
          ) : (
            <OutputPane text={result.error} wrap tone="error" />
          )
        }
      />
    </ToolFrame>
  );
}
