import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['color-converter']!;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function parse(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  let m = /^#?([0-9a-f]{3})$/.exec(s);
  if (m) {
    const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16));
    return { r, g, b };
  }
  m = /^#?([0-9a-f]{6})$/.exec(s);
  if (m) {
    const v = m[1];
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16),
    };
  }
  m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(s);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  m = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i.exec(s);
  if (m) return hslToRgb(+m[1], +m[2], +m[3]);
  return null;
}

function rgbToHex({ r, g, b }: RGB): string {
  return (
    '#' +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0'))
      .join('')
  );
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export default function ColorConverter() {
  const [input, setInput] = useState('#00ff88');
  const parsed = useMemo(() => parse(input), [input]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
          placeholder="#00ff88, rgb(0,255,136), hsl(150,100%,50%)"
          spellCheck={false}
        />
        {parsed ? (
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div
              className="rounded-lg border border-border h-32 sm:h-auto sm:min-h-[140px]"
              style={{ background: rgbToHex(parsed) }}
              aria-label="Color preview"
            />
            <div className="card p-3 text-sm font-mono space-y-1.5">
              <Row label="HEX" value={rgbToHex(parsed)} />
              <Row label="RGB" value={`rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`} />
              {(() => {
                const { h, s, l } = rgbToHsl(parsed);
                return <Row label="HSL" value={`hsl(${h}, ${s}%, ${l}%)`} />;
              })()}
            </div>
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">
            Could not parse "{input}".
          </pre>
        )}
      </div>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-12">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
