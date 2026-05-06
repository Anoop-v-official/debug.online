import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';
import { utf8ByteSize, formatBytes } from '../lib/byteSize';

const tool = toolBySlug['svg-optimizer']!;

function optimize(svg: string): string {
  let out = svg;
  // Strip XML processing instructions
  out = out.replace(/<\?xml[^?]*\?>/g, '');
  // Strip DOCTYPE
  out = out.replace(/<!DOCTYPE[^>]*>/gi, '');
  // Strip comments
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // Strip metadata, title, desc tags
  out = out.replace(/<(metadata|title|desc)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Remove editor-specific attributes
  out = out.replace(/\s+(?:inkscape|sodipodi|sketch|figma):[a-z-]+="[^"]*"/gi, '');
  out = out.replace(/\s+xmlns:(?:inkscape|sodipodi|sketch|figma)="[^"]*"/gi, '');
  // Remove id attributes that look auto-generated
  out = out.replace(/\s+id="(?:svg_|layer_|path_|g_|_|x|XMLID_)[\w-]*"/gi, '');
  // Collapse runs of whitespace inside tags
  out = out.replace(/>\s+</g, '><');
  // Trim leading/trailing whitespace
  out = out.trim();
  // Round numeric attributes to 2 decimals
  out = out.replace(/(\d*\.\d{3,})/g, (m) => Number(m).toFixed(2));
  return out;
}

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with Inkscape -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     viewBox="0 0 32 32" width="32" height="32">
  <title>icon</title>
  <metadata>...</metadata>
  <rect id="svg_1" width="32" height="32" rx="6.0000001" fill="#0a0a0a"/>
  <path d="M8.234234234 11 L13 16 L8 21" stroke="#00ff88" stroke-width="2.5" fill="none"/>
</svg>`;

export default function SvgOptimizer() {
  const [input, setInput] = useState(SAMPLE);
  const optimized = useMemo(() => optimize(input), [input]);
  const inSize = utf8ByteSize(input);
  const outSize = utf8ByteSize(optimized);
  const savings = inSize > 0 ? Math.round(((inSize - outSize) / inSize) * 100) : 0;

  return (
    <ToolFrame tool={tool} actions={<CopyButton text={optimized} />}>
      <div className="space-y-3">
        <SplitPane
          leftLabel={`Original · ${formatBytes(inSize)}`}
          rightLabel={`Optimized · ${formatBytes(outSize)} (-${savings}%)`}
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
            <OutputPane
              text={optimized}
              wrap
              className="text-xs"
              copyLabel="Copy optimized SVG"
            />
          }
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <Preview title="Before" svg={input} />
          <Preview title="After" svg={optimized} />
        </div>

        <p className="text-2xs text-subtle font-mono">
          Strips comments, editor metadata, DOCTYPE, generated IDs, and rounds long decimals. For
          path-level compression use SVGO.
        </p>
      </div>
    </ToolFrame>
  );
}

function Preview({ title, svg }: { title: string; svg: string }) {
  return (
    <div className="card p-3 space-y-2">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">{title}</div>
      <div
        className="border border-border rounded h-32 flex items-center justify-center bg-surface-2 [&>svg]:max-w-full [&>svg]:max-h-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
