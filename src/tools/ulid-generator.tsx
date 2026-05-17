import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['ulid-generator']!;

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32

function encodeTime(ms: number, len: number): string {
  let out = '';
  let n = ms;
  for (let i = len - 1; i >= 0; i--) {
    out = ENCODING[n & 0x1f] + out;
    n = Math.floor(n / 32);
  }
  return out;
}

function encodeRandom(len: number): string {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ENCODING[buf[i] & 0x1f];
  }
  return out;
}

function generate(): string {
  return encodeTime(Date.now(), 10) + encodeRandom(16);
}

function decode(s: string): { time: Date; random: string } | null {
  const u = s.trim().toUpperCase();
  if (!/^[0-9A-HJKMNPQRSTVWXYZ]{26}$/.test(u)) return null;
  let ms = 0;
  for (let i = 0; i < 10; i++) {
    ms = ms * 32 + ENCODING.indexOf(u[i]);
  }
  return { time: new Date(ms), random: u.slice(10) };
}

export default function UlidGenerator() {
  const [count, setCount] = useState(8);
  const [list, setList] = useState<string[]>(() => Array.from({ length: 8 }, generate));
  const [inspect, setInspect] = useState('');

  const decoded = decode(inspect);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
            }
            className="input w-20 py-1.5"
            aria-label="Count"
          />
          <button
            type="button"
            className="btn-accent"
            onClick={() => setList(Array.from({ length: count }, generate))}
          >
            Generate
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <OutputPane text={list.join('\n')} copyLabel="Copy all ULIDs" />

        <div className="card p-3 space-y-2">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
            Decode a ULID
          </div>
          <input
            value={inspect}
            onChange={(e) => setInspect(e.target.value)}
            className="input font-mono"
            placeholder="01J7K0X3MZAB1Q5W7V2N4F8GTH"
            spellCheck={false}
          />
          {inspect.trim() ? (
            decoded ? (
              <div className="text-sm font-mono space-y-1">
                <div>
                  <span className="text-subtle text-2xs uppercase tracking-wide mr-2">
                    Time
                  </span>
                  {decoded.time.toISOString()}
                </div>
                <div>
                  <span className="text-subtle text-2xs uppercase tracking-wide mr-2">
                    Random
                  </span>
                  {decoded.random}
                </div>
              </div>
            ) : (
              <div className="text-xs text-error">Not a valid ULID.</div>
            )
          ) : null}
        </div>

        <p className="text-2xs text-subtle font-mono">
          ULID = 48-bit millisecond timestamp + 80 bits of randomness, encoded as 26 Crockford-base32 characters. Lexically sortable, URL-safe, and shorter than UUID. See the ULID spec for full details.
        </p>
      </div>
    </ToolFrame>
  );
}
