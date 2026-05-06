import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['cron-parser']!;

const FIELDS = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'] as const;
const PRESETS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function describePart(part: string, kind: typeof FIELDS[number]): string {
  if (part === '*') {
    return `every ${kind === 'day-of-week' ? 'day of the week' : kind}`;
  }
  if (part.startsWith('*/')) return `every ${part.slice(2)} ${kind}s`;
  if (part.includes(',')) return part.split(',').join(', ');
  if (part.includes('-')) return `${part.replace('-', ' through ')}`;
  if (kind === 'month') {
    const n = Number(part);
    if (n >= 1 && n <= 12) return MONTHS[n - 1];
  }
  if (kind === 'day-of-week') {
    const n = Number(part);
    if (n >= 0 && n <= 7) return DAYS[n % 7];
  }
  return part;
}

function describe(expr: string): string {
  const norm = PRESETS[expr.trim()] ?? expr.trim();
  const parts = norm.split(/\s+/);
  if (parts.length !== 5) {
    return 'Cron expressions need 5 fields: minute hour day month weekday.';
  }
  const [min, hr, dom, mo, dow] = parts;
  const segs: string[] = [];
  if (min === '*' && hr === '*') segs.push('every minute');
  else if (min === '0' && hr === '*') segs.push('at the top of every hour');
  else if (min !== '*' && hr !== '*') {
    segs.push(`at ${hr.padStart(2, '0')}:${min.padStart(2, '0')}`);
  } else {
    segs.push(`minute ${describePart(min, 'minute')}, hour ${describePart(hr, 'hour')}`);
  }
  if (dom !== '*') segs.push(`on day-of-month ${describePart(dom, 'day-of-month')}`);
  if (mo !== '*') segs.push(`in ${describePart(mo, 'month')}`);
  if (dow !== '*') segs.push(`on ${describePart(dow, 'day-of-week')}`);
  return segs.join(', ') + '.';
}

export default function CronParser() {
  const [input, setInput] = useState('*/15 9-17 * * 1-5');
  const description = useMemo(() => describe(input), [input]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input }),
        applyState: (s) => {
          const v = s as { input?: string };
          if (typeof v.input === 'string') setInput(v.input);
        },
      }}
    >
      <div className="space-y-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          spellCheck={false}
          placeholder="* * * * *"
        />
        <p className="card p-3 text-sm leading-relaxed">{description}</p>
        <p className="text-2xs text-subtle font-mono">
          Supports *, lists (1,3,5), ranges (1-5), steps (*/15), and aliases like @daily.
        </p>
      </div>
    </ToolFrame>
  );
}
