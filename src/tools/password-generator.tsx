import { useEffect, useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['password-generator']!;

const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>/?';
const SIMILAR = /[il1Lo0O]/g;

const WORDS = `correct horse battery staple ocean stone river forest cloud light shadow flame anchor signal vector circuit pixel quantum kernel matrix octopus harbor velvet meadow lantern compass tundra echo glacier ember whisper saffron mosaic citrus puzzle marble ledger`.split(/\s+/);

function genPassword(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}): string {
  let pool = '';
  if (opts.lower) pool += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.upper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.digits) pool += '0123456789';
  if (opts.symbols) pool += SYMBOLS;
  if (opts.excludeSimilar) pool = pool.replace(SIMILAR, '');
  if (!pool) return '';
  const buf = new Uint32Array(opts.length);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < opts.length; i++) out += pool[buf[i] % pool.length];
  return out;
}

function genPassphrase(words: number, sep: string): string {
  const buf = new Uint32Array(words);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => WORDS[n % WORDS.length]).join(sep);
}

function strength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '—', color: 'text-subtle' };
  const variety =
    +/[a-z]/.test(p) + +/[A-Z]/.test(p) + +/\d/.test(p) + +/[^A-Za-z0-9]/.test(p);
  const entropy = p.length * (variety * 1.5 + 1);
  if (entropy < 30) return { score: 1, label: 'Weak', color: 'text-error' };
  if (entropy < 60) return { score: 2, label: 'Fair', color: 'text-warning' };
  if (entropy < 100) return { score: 3, label: 'Strong', color: 'text-accent' };
  return { score: 4, label: 'Very strong', color: 'text-accent' };
}

export default function PasswordGenerator() {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password');
  const [length, setLength] = useState(20);
  const [words, setWords] = useState(4);
  const [sep, setSep] = useState('-');
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [seed, setSeed] = useState(0);

  const value = useMemo(() => {
    if (mode === 'password') {
      return genPassword({ length, upper, lower, digits, symbols, excludeSimilar });
    }
    return genPassphrase(words, sep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length, words, sep, upper, lower, digits, symbols, excludeSimilar, seed]);

  const s = strength(value);

  useEffect(() => {
    setSeed((n) => n + 1);
  }, [mode]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <>
          <button type="button" className="btn" onClick={() => setSeed((n) => n + 1)}>
            Regenerate
          </button>
          <CopyButton text={value} />
        </>
      }
    >
      <div className="space-y-5">
        <div className="card p-4 font-mono text-base sm:text-lg break-all flex items-center justify-between gap-3">
          <span className="text-text">{value || <span className="text-subtle">empty</span>}</span>
          <span className={`text-xs font-mono shrink-0 ${s.color}`}>{s.label}</span>
        </div>

        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(['password', 'passphrase'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`px-3 py-1.5 text-xs ${mode === m ? 'bg-surface-2 text-text' : 'text-muted'}`}
              onClick={() => setMode(m)}
            >
              {m === 'password' ? 'Random' : 'Passphrase'}
            </button>
          ))}
        </div>

        {mode === 'password' ? (
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-muted">
              <span className="w-20">Length</span>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="w-10 text-right font-mono text-text">{length}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Toggle label="Lowercase a-z" checked={lower} onChange={setLower} />
              <Toggle label="Uppercase A-Z" checked={upper} onChange={setUpper} />
              <Toggle label="Digits 0-9" checked={digits} onChange={setDigits} />
              <Toggle label="Symbols !@#" checked={symbols} onChange={setSymbols} />
              <Toggle
                label="Exclude similar (i/l/1, O/0)"
                checked={excludeSimilar}
                onChange={setExcludeSimilar}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-muted">
              <span className="w-20">Words</span>
              <input
                type="range"
                min={3}
                max={10}
                value={words}
                onChange={(e) => setWords(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="w-10 text-right font-mono text-text">{words}</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-muted">
              <span className="w-20">Separator</span>
              <input
                value={sep}
                onChange={(e) => setSep(e.target.value)}
                maxLength={3}
                className="input w-20"
              />
            </label>
          </div>
        )}
      </div>
    </ToolFrame>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}
