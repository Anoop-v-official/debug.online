import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['shadow-generator']!;

interface Layer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export default function ShadowGenerator() {
  const [mode, setMode] = useState<'box' | 'text'>('box');
  const [layers, setLayers] = useState<Layer[]>([
    { x: 0, y: 8, blur: 24, spread: -4, color: '#00000099', inset: false },
  ]);

  const css = useMemo(() => layers.map(toCss).join(', '), [layers]);

  function update(i: number, patch: Partial<Layer>) {
    setLayers((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <ToolFrame
      tool={tool}
      actions={<CopyButton text={`${mode === 'box' ? 'box-shadow' : 'text-shadow'}: ${css};`} />}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border h-56 flex items-center justify-center bg-surface-2">
          {mode === 'box' ? (
            <div
              className="w-32 h-32 rounded-lg bg-accent"
              style={{ boxShadow: css }}
              aria-label="Box shadow preview"
            />
          ) : (
            <span
              className="font-display text-5xl font-bold text-text"
              style={{ textShadow: css }}
            >
              Aa
            </span>
          )}
        </div>

        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(['box', 'text'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`px-3 py-1.5 text-xs ${mode === m ? 'bg-surface-2 text-text' : 'text-muted'}`}
              onClick={() => setMode(m)}
            >
              {m === 'box' ? 'Box shadow' : 'Text shadow'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {layers.map((l, i) => (
            <div key={i} className="card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-subtle">Layer {i + 1}</span>
                {mode === 'box' ? (
                  <label className="text-xs text-muted flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={l.inset}
                      onChange={(e) => update(i, { inset: e.target.checked })}
                      className="accent-accent"
                    />
                    inset
                  </label>
                ) : null}
                {layers.length > 1 ? (
                  <button
                    type="button"
                    className="btn-ghost text-error text-xs"
                    onClick={() => setLayers((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Slider label="x" value={l.x} min={-50} max={50} onChange={(v) => update(i, { x: v })} />
                <Slider label="y" value={l.y} min={-50} max={50} onChange={(v) => update(i, { y: v })} />
                <Slider label="blur" value={l.blur} min={0} max={80} onChange={(v) => update(i, { blur: v })} />
                {mode === 'box' ? (
                  <Slider
                    label="spread"
                    value={l.spread}
                    min={-40}
                    max={40}
                    onChange={(v) => update(i, { spread: v })}
                  />
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={l.color.slice(0, 7)}
                  onChange={(e) => update(i, { color: e.target.value })}
                  className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer"
                />
                <input
                  value={l.color}
                  onChange={(e) => update(i, { color: e.target.value })}
                  className="input font-mono"
                  spellCheck={false}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() =>
              setLayers((s) => [
                ...s,
                { x: 0, y: 4, blur: 12, spread: 0, color: '#00000055', inset: false },
              ])
            }
          >
            + Add layer
          </button>
        </div>

        <OutputPane
          text={`${mode === 'box' ? 'box-shadow' : 'text-shadow'}: ${css};`}
          wrap
          copyLabel="Copy CSS"
        />
      </div>
    </ToolFrame>
  );
}

function toCss(l: Layer): string {
  const inset = l.inset ? 'inset ' : '';
  return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="w-10 text-subtle">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-accent"
      />
      <span className="font-mono text-xs w-8 text-right">{value}</span>
    </label>
  );
}
