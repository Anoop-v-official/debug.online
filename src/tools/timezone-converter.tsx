import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['timezone-converter']!;

const COMMON_ZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function fmt(d: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: tz,
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return 'Invalid timezone';
  }
}

function detect(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export default function TimezoneConverter() {
  const [iso, setIso] = useState<string>(() => toLocalInput(new Date()));
  const [zones, setZones] = useState<string[]>([
    detect(),
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Kolkata',
    'Asia/Tokyo',
  ]);
  const [newZone, setNewZone] = useState('');

  const date = useMemo(() => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }, [iso]);

  function add() {
    const z = newZone.trim();
    if (!z) return;
    if (zones.includes(z)) return;
    try {
      new Intl.DateTimeFormat('en', { timeZone: z });
    } catch {
      return;
    }
    setZones((zs) => [...zs, z]);
    setNewZone('');
  }

  return (
    <ToolFrame
      tool={tool}
      actions={
        <button
          type="button"
          className="btn"
          onClick={() => setIso(toLocalInput(new Date()))}
        >
          Now
        </button>
      }
    >
      <div className="space-y-4">
        <label className="text-sm text-muted block">
          Source date / time (in your local timezone)
          <input
            type="datetime-local"
            value={iso}
            onChange={(e) => setIso(e.target.value)}
            className="input mt-1 font-mono"
            step="1"
          />
        </label>

        {date ? (
          <div className="card divide-y divide-border">
            {zones.map((z) => (
              <div
                key={z}
                className="flex items-center justify-between gap-3 px-3 py-2 font-mono text-sm"
              >
                <div className="min-w-0">
                  <div className="text-text">{z}</div>
                  <div className="text-2xs text-subtle">{fmt(date, z)}</div>
                </div>
                {zones.length > 1 ? (
                  <button
                    type="button"
                    aria-label={`Remove ${z}`}
                    onClick={() => setZones((zs) => zs.filter((x) => x !== z))}
                    className="btn-ghost text-error text-sm"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">Invalid date.</pre>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            list="tz-list"
            value={newZone}
            onChange={(e) => setNewZone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add timezone (e.g. Europe/Madrid)"
            className="input flex-1 min-w-[200px] font-mono"
            spellCheck={false}
          />
          <datalist id="tz-list">
            {COMMON_ZONES.map((z) => (
              <option key={z} value={z} />
            ))}
          </datalist>
          <button type="button" className="btn" onClick={add}>
            Add
          </button>
        </div>
      </div>
    </ToolFrame>
  );
}
