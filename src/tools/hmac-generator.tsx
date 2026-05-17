import { useEffect, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['hmac-generator']!;

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algo = (typeof ALGOS)[number];

async function hmac(algo: Algo, secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: algo },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bytesToBase64(hex: string): string {
  let bin = '';
  for (let i = 0; i < hex.length; i += 2) {
    bin += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  }
  return btoa(bin);
}

export default function HmacGenerator() {
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [secret, setSecret] = useState('my-shared-secret');
  const [message, setMessage] = useState('payload to sign');
  const [hex, setHex] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!secret || !message) {
      setHex('');
      setErr(null);
      return;
    }
    hmac(algo, secret, message)
      .then((h) => {
        if (!cancelled) {
          setHex(h);
          setErr(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'HMAC failed');
      });
    return () => {
      cancelled = true;
    };
  }, [algo, secret, message]);

  const base64 = hex ? bytesToBase64(hex) : '';

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ algo, message }),
        applyState: (s) => {
          const v = s as { algo?: Algo; message?: string };
          if (v.algo && (ALGOS as readonly string[]).includes(v.algo)) setAlgo(v.algo);
          if (typeof v.message === 'string') setMessage(v.message);
        },
      }}
      actions={
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value as Algo)}
          className="input w-auto py-1.5"
          aria-label="HMAC algorithm"
        >
          {ALGOS.map((a) => (
            <option key={a} value={a}>
              HMAC-{a.replace('-', '')}
            </option>
          ))}
        </select>
      }
    >
      <div className="space-y-4">
        <label className="text-sm text-muted block">
          Secret key
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="input mt-1 font-mono"
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        <label className="text-sm text-muted block">
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            spellCheck={false}
            className="textarea mt-1 font-mono text-xs min-h-[120px]"
          />
        </label>

        {err ? <pre className="card p-3 text-xs font-mono text-error">{err}</pre> : null}

        <div className="space-y-3">
          <div>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              Hex digest
            </div>
            <OutputPane text={hex} wrap copyLabel="Copy hex">
              {hex || <span className="text-subtle">HMAC appears here.</span>}
            </OutputPane>
          </div>
          <div>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              Base64
            </div>
            <OutputPane text={base64} wrap copyLabel="Copy base64">
              {base64 || <span className="text-subtle">—</span>}
            </OutputPane>
          </div>
        </div>

        <p className="text-2xs text-subtle font-mono">
          Used by webhook providers (Stripe, GitHub, Slack) to sign request bodies. The
          receiver re-computes the HMAC with the shared secret and compares.
        </p>
      </div>
    </ToolFrame>
  );
}
