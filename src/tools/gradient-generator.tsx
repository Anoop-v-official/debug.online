import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['gradient-generator']!;

interface Stop {
  color: string;
  pos: number;
}

const PRESETS: { name: string; type: 'linear' | 'radial' | 'conic'; angle: number; stops: Stop[] }[] = [
  {
    name: 'Aurora',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#00ff88', pos: 0 },
      { color: '#00e0ff', pos: 100 },
    ],
  },
  {
    name: 'Sunset',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#ff5e5e', pos: 0 },
      { color: '#f5a623', pos: 50 },
      { color: '#fbbf24', pos: 100 },
    ],
  },
  {
    name: 'Mesh radial',
    type: 'radial',
    angle: 0,
    stops: [
      { color: '#c084fc', pos: 0 },
      { color: '#0a0a0f', pos: 100 },
    ],
  },
  {
    name: 'Conic spin',
    type: 'conic',
    angle: 0,
    stops: [
      { color: '#00ff88', pos: 0 },
      { color: '#00e0ff', pos: 33 },
      { color: '#c084fc', pos: 66 },
      { color: '#00ff88', pos: 100 },
    ],
  },
];

export default function GradientGenerator() {
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { color: '#00ff88', pos: 0 },
    { color: '#00e0ff', pos: 100 },
  ]);

  const css = useMemo(() => buildCss(type, angle, stops), [type, angle, stops]);

  function update(i: number, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  return (
    <ToolFrame
      tool={tool}
      actions={<CopyButton text={`background: ${css};`} />}
    >
      <div className="space-y-4">
        <div
          className="rounded-lg border border-border h-48"
          style={{ background: css }}
          aria-label="Gradient preview"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="input w-auto"
          >
            <option value="linear">linear-gradient</option>
            <option value="radial">radial-gradient</option>
            <option value="conic">conic-gradient</option>
          </select>
          {type === 'linear' || type === 'conic' ? (
            <label className="text-sm text-muted flex items-center gap-2">
              Angle
              <input
                type="number"
                value={angle}
                min={0}
                max={360}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="input w-20"
              />
              °
            </label>
          ) : null}
          <button
            type="button"
            className="btn"
            onClick={() =>
              setStops((s) => [...s, { color: '#ffffff', pos: 100 }])
            }
          >
            + Add stop
          </button>
        </div>

        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={s.color}
                onChange={(e) => update(i, { color: e.target.value })}
                className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer"
              />
              <input
                value={s.color}
                onChange={(e) => update(i, { color: e.target.value })}
                className="input font-mono w-32"
                spellCheck={false}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={s.pos}
                onChange={(e) => update(i, { pos: Number(e.target.value) })}
                className="flex-1 accent-accent"
              />
              <span className="font-mono text-xs w-10 text-right">{s.pos}%</span>
              {stops.length > 2 ? (
                <button
                  type="button"
                  className="btn-ghost text-error"
                  onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove stop"
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div>
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">Presets</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="px-3 py-1.5 rounded-md border border-border bg-surface text-xs hover:border-accent"
                onClick={() => {
                  setType(p.type);
                  setAngle(p.angle);
                  setStops(p.stops);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <OutputPane text={`background: ${css};`} wrap copyLabel="Copy CSS" />
      </div>
    </ToolFrame>
  );
}

function buildCss(type: 'linear' | 'radial' | 'conic', angle: number, stops: Stop[]): string {
  const parts = stops
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `${s.color} ${s.pos}%`)
    .join(', ');
  if (type === 'linear') return `linear-gradient(${angle}deg, ${parts})`;
  if (type === 'radial') return `radial-gradient(circle, ${parts})`;
  return `conic-gradient(from ${angle}deg, ${parts})`;
}
