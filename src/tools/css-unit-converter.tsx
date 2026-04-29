import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['css-unit-converter']!;

interface Conv {
  px: number;
  rem: number;
  em: number;
  pt: number;
  vw: number;
  vh: number;
  percent: number;
}

function compute(value: number, unit: keyof Conv, base: number, vw: number, vh: number, parent: number): Conv {
  let px = 0;
  switch (unit) {
    case 'px':
      px = value;
      break;
    case 'rem':
      px = value * base;
      break;
    case 'em':
      px = value * parent;
      break;
    case 'pt':
      px = (value * 96) / 72;
      break;
    case 'vw':
      px = (value * vw) / 100;
      break;
    case 'vh':
      px = (value * vh) / 100;
      break;
    case 'percent':
      px = (value * parent) / 100;
      break;
  }
  return {
    px: round(px),
    rem: round(px / base),
    em: round(px / parent),
    pt: round((px * 72) / 96),
    vw: round((px / vw) * 100),
    vh: round((px / vh) * 100),
    percent: round((px / parent) * 100),
  };
}

function round(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

export default function CssUnitConverter() {
  const [value, setValue] = useState(16);
  const [unit, setUnit] = useState<keyof Conv>('px');
  const [base, setBase] = useState(16);
  const [vw, setVw] = useState(1280);
  const [vh, setVh] = useState(720);
  const [parent, setParent] = useState(16);

  const result = useMemo(() => compute(value, unit, base, vw, vh, parent), [value, unit, base, vw, vh, parent]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm text-muted">
            Value
            <input
              type="number"
              value={value}
              step="any"
              onChange={(e) => setValue(Number(e.target.value) || 0)}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-muted">
            Source unit
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as keyof Conv)}
              className="input mt-1"
            >
              <option value="px">px</option>
              <option value="rem">rem</option>
              <option value="em">em</option>
              <option value="pt">pt</option>
              <option value="vw">vw</option>
              <option value="vh">vh</option>
              <option value="percent">%</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Root font size (px)
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(Number(e.target.value) || 16)}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-muted">
            Parent font size (px)
            <input
              type="number"
              value={parent}
              onChange={(e) => setParent(Number(e.target.value) || 16)}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-muted">
            Viewport W (px)
            <input
              type="number"
              value={vw}
              onChange={(e) => setVw(Number(e.target.value) || 1280)}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-muted">
            Viewport H (px)
            <input
              type="number"
              value={vh}
              onChange={(e) => setVh(Number(e.target.value) || 720)}
              className="input mt-1"
            />
          </label>
        </div>

        <div className="card divide-y divide-border font-mono text-sm">
          {(Object.keys(result) as (keyof Conv)[]).map((k) => (
            <Row key={k} unit={k === 'percent' ? '%' : k} value={result[k]} />
          ))}
        </div>
      </div>
    </ToolFrame>
  );
}

function Row({ unit, value }: { unit: string; value: number }) {
  const text = `${value}${unit}`;
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-12">{unit}</span>
      <span className="text-text flex-1">{text}</span>
      <CopyButton text={text} />
    </div>
  );
}
