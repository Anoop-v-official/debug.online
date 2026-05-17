import { useEffect, useMemo, useRef, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['totp-generator']!;

// RFC 6238 TOTP

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function decodeBase32(s: string): Uint8Array | null {
  const cleaned = s.toUpperCase().replace(/[^A-Z2-7]/g, '');
  if (!cleaned) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of cleaned) {
    const v = B32.indexOf(ch);
    if (v < 0) return null;
    value = (value << 5) | v;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

async function hotp(secret: Uint8Array, counter: bigint, algo: string, digits: number): Promise<string> {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setBigUint64(0, counter, false);
  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash: algo },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const offset = sig[sig.length - 1] & 0x0f;
  const binary =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export default function TotpGenerator() {
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP'); // "Hello!" sample
  const [digits, setDigits] = useState<6 | 7 | 8>(6);
  const [period, setPeriod] = useState(30);
  const [algo, setAlgo] = useState<'SHA-1' | 'SHA-256' | 'SHA-512'>('SHA-1');
  const [code, setCode] = useState('');
  const [next, setNext] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const interval = useRef<number | undefined>(undefined);

  useEffect(() => {
    interval.current = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(interval.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = decodeBase32(secret);
    if (!key) {
      setErr('Invalid base32 secret.');
      setCode('');
      setNext('');
      return;
    }
    setErr(null);
    const counter = BigInt(Math.floor(now / period));
    Promise.all([
      hotp(key, counter, algo, digits),
      hotp(key, counter + 1n, algo, digits),
    ]).then(([c, n]) => {
      if (!cancelled) {
        setCode(c);
        setNext(n);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [secret, digits, period, algo, now]);

  const remaining = useMemo(() => period - (now % period), [now, period]);
  const uri = useMemo(() => {
    return `otpauth://totp/debugdaily?secret=${secret}&algorithm=${algo.replace('-', '')}&digits=${digits}&period=${period}`;
  }, [secret, digits, period, algo]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ secret, digits, period, algo }),
        applyState: (s) => {
          const v = s as { secret?: string; digits?: 6 | 7 | 8; period?: number; algo?: typeof algo };
          if (typeof v.secret === 'string') setSecret(v.secret);
          if (v.digits === 6 || v.digits === 7 || v.digits === 8) setDigits(v.digits);
          if (typeof v.period === 'number') setPeriod(v.period);
          if (v.algo === 'SHA-1' || v.algo === 'SHA-256' || v.algo === 'SHA-512') setAlgo(v.algo);
        },
      }}
    >
      <div className="space-y-4">
        <label className="text-sm text-muted block">
          Secret (base32)
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="input mt-1 font-mono"
            spellCheck={false}
            placeholder="JBSWY3DPEHPK3PXP"
          />
        </label>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm text-muted">
            Algorithm
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as typeof algo)}
              className="input mt-1"
            >
              <option value="SHA-1">SHA-1 (standard)</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Digits
            <select
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value) as 6 | 7 | 8)}
              className="input mt-1"
            >
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Period (s)
            <input
              type="number"
              value={period}
              min={10}
              max={120}
              onChange={(e) => setPeriod(Number(e.target.value) || 30)}
              className="input mt-1"
            />
          </label>
        </div>

        {err ? <pre className="card p-3 text-xs font-mono text-error">{err}</pre> : null}

        <div className="card p-5 text-center space-y-2">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
            Current code
          </div>
          <div className="font-display text-5xl font-semibold tracking-widest text-accent">
            {code || '------'}
          </div>
          <div className="text-2xs text-subtle font-mono">
            valid for {remaining}s · next: {next || '—'}
          </div>
          <div className="w-full h-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-1000"
              style={{ width: `${(remaining / period) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
            otpauth:// URI (paste into a QR code generator to import to authenticator apps)
          </div>
          <OutputPane text={uri} wrap copyLabel="Copy URI" />
        </div>

        <p className="text-2xs text-subtle font-mono">
          Standard TOTP per RFC 6238. Google Authenticator, 1Password, Authy and Bitwarden all use SHA-1 + 6 digits + 30s by default.
        </p>
      </div>
    </ToolFrame>
  );
}
