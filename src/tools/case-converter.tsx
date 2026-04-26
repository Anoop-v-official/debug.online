import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['case-converter']!;

function tokens(s: string): string[] {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function camel(t: string[]): string {
  return t.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('');
}
function pascal(t: string[]): string {
  return t.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}
function snake(t: string[]): string {
  return t.join('_');
}
function kebab(t: string[]): string {
  return t.join('-');
}
function constant(t: string[]): string {
  return t.join('_').toUpperCase();
}
function title(t: string[]): string {
  return t.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}
function sentence(t: string[]): string {
  if (t.length === 0) return '';
  return t[0][0].toUpperCase() + t[0].slice(1) + (t.length > 1 ? ' ' + t.slice(1).join(' ') : '');
}

export default function CaseConverter() {
  const [input, setInput] = useState('hello debug online');
  const t = useMemo(() => tokens(input), [input]);

  const rows: Array<[string, string]> = [
    ['camelCase', camel(t)],
    ['PascalCase', pascal(t)],
    ['snake_case', snake(t)],
    ['kebab-case', kebab(t)],
    ['CONSTANT_CASE', constant(t)],
    ['Title Case', title(t)],
    ['Sentence case', sentence(t)],
    ['UPPERCASE', input.toUpperCase()],
    ['lowercase', input.toLowerCase()],
  ];

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
          spellCheck={false}
        />
        <div className="card p-3 text-sm font-mono divide-y divide-border">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-subtle text-2xs uppercase tracking-wide w-32 shrink-0">
                {label}
              </span>
              <span className="text-text flex-1 break-all">
                {value || <span className="text-subtle">empty</span>}
              </span>
              <CopyButton text={value} />
            </div>
          ))}
        </div>
      </div>
    </ToolFrame>
  );
}
