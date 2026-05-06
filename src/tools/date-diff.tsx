import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['date-diff']!;

interface Diff {
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  totalWeeks: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  workingDays: number;
}

function workingDaysBetween(a: Date, b: Date): number {
  if (a > b) [a, b] = [b, a];
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  let count = 0;
  const cur = new Date(start);
  while (cur < end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function diff(a: Date, b: Date): Diff {
  const ms = b.getTime() - a.getTime();
  const sign = Math.sign(ms);
  const abs = Math.abs(ms);

  const totalSeconds = Math.floor(abs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);

  // Calendar-aware breakdown
  let from = a < b ? a : b;
  let to = a < b ? b : a;
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  let hours = to.getHours() - from.getHours();
  let minutes = to.getMinutes() - from.getMinutes();
  let seconds = to.getSeconds() - from.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    totalSeconds: sign * totalSeconds,
    totalMinutes: sign * totalMinutes,
    totalHours: sign * totalHours,
    totalDays: sign * totalDays,
    totalWeeks: sign * totalWeeks,
    years: sign * years,
    months: sign * months,
    days: sign * days,
    hours: sign * hours,
    minutes: sign * minutes,
    seconds: sign * seconds,
    workingDays: sign * workingDaysBetween(from, to),
  };
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function DateDiff() {
  const [a, setA] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return toLocalInput(d);
  });
  const [b, setB] = useState(() => toLocalInput(new Date()));

  const result = useMemo(() => {
    const da = new Date(a);
    const db = new Date(b);
    if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
    return diff(da, db);
  }, [a, b]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm text-muted">
            From
            <input
              type="datetime-local"
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="input mt-1 font-mono"
              step="1"
            />
          </label>
          <label className="text-sm text-muted">
            To
            <input
              type="datetime-local"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="input mt-1 font-mono"
              step="1"
            />
          </label>
        </div>

        {result ? (
          <>
            <div className="card p-4">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
                Calendar breakdown
              </div>
              <div className="font-display text-2xl font-semibold">
                {fmtUnits(result)}
              </div>
            </div>

            <div className="card divide-y divide-border font-mono text-sm">
              <Row label="Total seconds" value={result.totalSeconds.toLocaleString()} />
              <Row label="Total minutes" value={result.totalMinutes.toLocaleString()} />
              <Row label="Total hours" value={result.totalHours.toLocaleString()} />
              <Row label="Total days" value={result.totalDays.toLocaleString()} />
              <Row label="Total weeks" value={result.totalWeeks.toLocaleString()} />
              <Row label="Working days (Mon–Fri)" value={result.workingDays.toLocaleString()} />
            </div>
          </>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">Invalid date inputs.</pre>
        )}
      </div>
    </ToolFrame>
  );
}

function fmtUnits(d: Diff): string {
  const sign = d.totalSeconds < 0 ? '-' : '';
  const abs = (n: number) => Math.abs(n);
  const parts: string[] = [];
  if (abs(d.years)) parts.push(`${abs(d.years)}y`);
  if (abs(d.months)) parts.push(`${abs(d.months)}m`);
  if (abs(d.days)) parts.push(`${abs(d.days)}d`);
  if (abs(d.hours)) parts.push(`${abs(d.hours)}h`);
  if (abs(d.minutes)) parts.push(`${abs(d.minutes)}min`);
  if (abs(d.seconds)) parts.push(`${abs(d.seconds)}s`);
  return sign + (parts.join(' ') || '0s');
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 px-3 py-1.5">
      <span className="text-subtle text-2xs uppercase tracking-wide">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
