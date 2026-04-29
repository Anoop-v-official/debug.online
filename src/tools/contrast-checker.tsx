import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['contrast-checker']!;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const v = hex.replace('#', '');
  if (v.length === 3) {
    return {
      r: parseInt(v[0] + v[0], 16),
      g: parseInt(v[1] + v[1], 16),
      b: parseInt(v[2] + v[2], 16),
    };
  }
  if (v.length === 6) {
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16),
    };
  }
  return null;
}

function relLum({ r, g, b }: { r: number; g: number; b: number }): number {
  const f = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: string, b: string): number | null {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  const la = relLum(ra);
  const lb = relLum(rb);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

interface Verdict {
  pass: boolean;
  label: string;
}

function verdict(ratio: number, large: boolean): { aa: Verdict; aaa: Verdict } {
  const aaThresh = large ? 3 : 4.5;
  const aaaThresh = large ? 4.5 : 7;
  return {
    aa: { pass: ratio >= aaThresh, label: `AA · ${aaThresh}:1` },
    aaa: { pass: ratio >= aaaThresh, label: `AAA · ${aaaThresh}:1` },
  };
}

export default function ContrastChecker() {
  const [fg, setFg] = useState('#0a0a0f');
  const [bg, setBg] = useState('#00ff88');
  const ratio = useMemo(() => contrast(fg, bg), [fg, bg]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-4">
        <div
          className="rounded-lg border border-border p-8 flex items-center justify-center min-h-[160px]"
          style={{ background: bg, color: fg }}
        >
          <div className="text-center space-y-1">
            <div className="text-2xl font-semibold">The quick brown fox</div>
            <div className="text-sm">jumps over the lazy dog · 14px body</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <ColorPick label="Foreground" value={fg} onChange={setFg} />
          <ColorPick label="Background" value={bg} onChange={setBg} />
        </div>

        {ratio === null ? (
          <pre className="card p-3 text-xs font-mono text-error">
            Use 3 or 6 digit hex colors (e.g. #00ff88).
          </pre>
        ) : (
          <div className="card p-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{ratio.toFixed(2)}:1</span>
              <span className="text-2xs uppercase tracking-wider text-subtle">Contrast ratio</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <Group title="Body text (≥14px)" v={verdict(ratio, false)} />
              <Group title="Large text (≥18px bold / 24px)" v={verdict(ratio, true)} />
            </div>
          </div>
        )}
      </div>
    </ToolFrame>
  );
}

function ColorPick({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-muted">
      <span className="w-28 text-subtle text-2xs uppercase tracking-wide">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input font-mono"
        spellCheck={false}
      />
    </label>
  );
}

function Group({ title, v }: { title: string; v: { aa: Verdict; aaa: Verdict } }) {
  return (
    <div className="space-y-1">
      <div className="text-2xs uppercase tracking-wide text-subtle">{title}</div>
      <Verdict v={v.aa} />
      <Verdict v={v.aaa} />
    </div>
  );
}

function Verdict({ v }: { v: Verdict }) {
  return (
    <div className={`flex items-center gap-2 ${v.pass ? 'text-accent' : 'text-error'}`}>
      <span>{v.pass ? '✓' : '✕'}</span>
      <span>{v.label}</span>
    </div>
  );
}
