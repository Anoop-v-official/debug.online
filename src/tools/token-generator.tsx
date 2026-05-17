import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['token-generator']!;

type Charset = 'hex' | 'base64url' | 'alphanumeric' | 'uppercase' | 'digits';

const ALPHABETS: Record<Charset, string> = {
  hex: '0123456789abcdef',
  base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  digits: '0123456789',
};

function generate(len: number, set: Charset, prefix: string): string {
  const alphabet = ALPHABETS[set];
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  let token = '';
  for (let i = 0; i < len; i++) {
    token += alphabet[buf[i] % alphabet.length];
  }
  return prefix + token;
}

export default function TokenGenerator() {
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(5);
  const [charset, setCharset] = useState<Charset>('base64url');
  const [prefix, setPrefix] = useState('');
  const [seed, setSeed] = useState(0);

  const list = useMemo(
    () => Array.from({ length: count }, () => generate(length, charset, prefix)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [length, count, charset, prefix, seed],
  );

  const PRESETS: { label: string; prefix: string }[] = [
    { label: 'plain', prefix: '' },
    { label: 'sk_live_', prefix: 'sk_live_' },
    { label: 'sk_test_', prefix: 'sk_test_' },
    { label: 'pk_', prefix: 'pk_' },
    { label: 'github_pat_', prefix: 'github_pat_' },
    { label: 'gho_', prefix: 'gho_' },
  ];

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ length, count, charset, prefix }),
        applyState: (s) => {
          const v = s as Partial<{ length: number; count: number; charset: Charset; prefix: string }>;
          if (typeof v.length === 'number') setLength(v.length);
          if (typeof v.count === 'number') setCount(v.count);
          if (v.charset && v.charset in ALPHABETS) setCharset(v.charset);
          if (typeof v.prefix === 'string') setPrefix(v.prefix);
        },
      }}
      actions={
        <button type="button" className="btn-accent" onClick={() => setSeed((n) => n + 1)}>
          Regenerate
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <label className="text-sm text-muted">
            Length
            <input
              type="number"
              value={length}
              min={8}
              max={128}
              onChange={(e) => setLength(Math.max(8, Math.min(128, Number(e.target.value) || 32)))}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-muted">
            Count
            <input
              type="number"
              value={count}
              min={1}
              max={100}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 5)))}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-muted">
            Charset
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value as Charset)}
              className="input mt-1"
            >
              <option value="base64url">base64url (URL-safe)</option>
              <option value="hex">hex</option>
              <option value="alphanumeric">alphanumeric</option>
              <option value="uppercase">UPPERCASE + digits</option>
              <option value="digits">digits only</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Prefix
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="input mt-1 font-mono"
              placeholder="sk_live_"
              spellCheck={false}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={
                'px-2.5 py-1 rounded-md text-xs border transition-colors font-mono ' +
                (prefix === p.prefix
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-surface border-border text-muted hover:text-text hover:border-border-strong')
              }
              onClick={() => setPrefix(p.prefix)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <OutputPane text={list.join('\n')} copyLabel="Copy all tokens" />

        <p className="text-2xs text-subtle font-mono">
          Uses crypto.getRandomValues — cryptographically secure. base64url is the standard
          for OAuth/JWT-shaped values; hex for HMAC-style secrets; Stripe/GitHub-style
          prefixes for human-recognizable env vars.
        </p>
      </div>
    </ToolFrame>
  );
}
