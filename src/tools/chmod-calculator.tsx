import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['chmod-calculator']!;

type Bit = { r: boolean; w: boolean; x: boolean };

function bitToOctal(b: Bit): number {
  return (b.r ? 4 : 0) | (b.w ? 2 : 0) | (b.x ? 1 : 0);
}
function octalToBit(n: number): Bit {
  return { r: !!(n & 4), w: !!(n & 2), x: !!(n & 1) };
}
function bitToSymbolic(b: Bit): string {
  return `${b.r ? 'r' : '-'}${b.w ? 'w' : '-'}${b.x ? 'x' : '-'}`;
}

export default function ChmodCalculator() {
  const [owner, setOwner] = useState<Bit>({ r: true, w: true, x: true });
  const [group, setGroup] = useState<Bit>({ r: true, w: false, x: true });
  const [other, setOther] = useState<Bit>({ r: true, w: false, x: true });

  const octal = useMemo(
    () => `${bitToOctal(owner)}${bitToOctal(group)}${bitToOctal(other)}`,
    [owner, group, other],
  );
  const symbolic = useMemo(
    () => `${bitToSymbolic(owner)}${bitToSymbolic(group)}${bitToSymbolic(other)}`,
    [owner, group, other],
  );
  const command = `chmod ${octal} file.txt`;

  function applyOctalInput(value: string) {
    const v = value.replace(/[^0-7]/g, '').slice(0, 3);
    if (v.length !== 3) return;
    setOwner(octalToBit(Number(v[0])));
    setGroup(octalToBit(Number(v[1])));
    setOther(octalToBit(Number(v[2])));
  }

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ octal }),
        applyState: (s) => {
          const v = s as { octal?: string };
          if (typeof v.octal === 'string') applyOctalInput(v.octal);
        },
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Bits label="Owner (u)" bit={owner} onChange={setOwner} />
          <Bits label="Group (g)" bit={group} onChange={setGroup} />
          <Bits label="Other (o)" bit={other} onChange={setOther} />
        </div>

        <div className="card p-4 space-y-2">
          <Row label="Octal">
            <input
              value={octal}
              onChange={(e) => applyOctalInput(e.target.value)}
              className="input font-mono w-24"
              maxLength={3}
            />
          </Row>
          <Row label="Symbolic">
            <span className="font-mono text-text">{symbolic}</span>
          </Row>
          <Row label="Command">
            <code className="font-mono text-accent">{command}</code>
          </Row>
        </div>

        <OutputPane text={command} wrap copyLabel="Copy chmod command" />
      </div>
    </ToolFrame>
  );
}

function Bits({
  label,
  bit,
  onChange,
}: {
  label: string;
  bit: Bit;
  onChange: (b: Bit) => void;
}) {
  return (
    <div className="card p-3 space-y-1.5">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
        {label}
      </div>
      {(['r', 'w', 'x'] as const).map((k) => (
        <label
          key={k}
          className="flex items-center gap-2 text-sm text-muted cursor-pointer"
        >
          <input
            type="checkbox"
            checked={bit[k]}
            onChange={(e) => onChange({ ...bit, [k]: e.target.checked })}
            className="accent-accent w-4 h-4"
          />
          <span className="font-mono">
            {k === 'r' ? 'r — read' : k === 'w' ? 'w — write' : 'x — execute'}
          </span>
        </label>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-subtle text-2xs uppercase tracking-wide w-20 shrink-0">
        {label}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
