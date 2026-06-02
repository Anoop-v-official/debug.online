import { useEffect, useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['jwt-generate']!;

const ALGOS = ['HS256', 'HS384', 'HS512'] as const;
type Algo = (typeof ALGOS)[number];

const ALGO_TO_HASH: Record<Algo, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToBase64Url(s: string): string {
  return bytesToBase64Url(new TextEncoder().encode(s));
}

async function sign(
  algo: Algo,
  secret: string,
  signingInput: string,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: ALGO_TO_HASH[algo] },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  return bytesToBase64Url(new Uint8Array(sig));
}

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: '1234567890',
    name: 'Jane Doe',
    iat: Math.floor(Date.now() / 1000),
  },
  null,
  2,
);

interface BuildResult {
  ok: boolean;
  token?: string;
  error?: string;
}

export default function JwtGenerate() {
  const [algo, setAlgo] = useState<Algo>('HS256');
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [result, setResult] = useState<BuildResult>({ ok: false });

  const header = useMemo(
    () => JSON.stringify({ alg: algo, typ: 'JWT' }),
    [algo],
  );

  // Parse payload once per change so the helper buttons can edit it.
  const parsedPayload = useMemo(() => {
    try {
      const v = JSON.parse(payload);
      if (v === null || typeof v !== 'object' || Array.isArray(v)) {
        return { ok: false as const, error: 'Payload must be a JSON object.' };
      }
      return { ok: true as const, value: v as Record<string, unknown> };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : 'Invalid JSON',
      };
    }
  }, [payload]);

  useEffect(() => {
    let cancelled = false;
    if (!parsedPayload.ok) {
      setResult({ ok: false, error: parsedPayload.error });
      return;
    }
    if (!secret) {
      setResult({ ok: false, error: 'Secret cannot be empty.' });
      return;
    }
    const compactPayload = JSON.stringify(parsedPayload.value);
    const signingInput = `${strToBase64Url(header)}.${strToBase64Url(compactPayload)}`;
    sign(algo, secret, signingInput)
      .then((signature) => {
        if (cancelled) return;
        setResult({ ok: true, token: `${signingInput}.${signature}` });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setResult({
          ok: false,
          error: e instanceof Error ? e.message : 'Signing failed.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [algo, secret, header, parsedPayload]);

  function patchPayload(updater: (current: Record<string, unknown>) => Record<string, unknown>) {
    if (!parsedPayload.ok) return;
    const next = updater(parsedPayload.value);
    setPayload(JSON.stringify(next, null, 2));
  }

  function setExpFromNow(seconds: number) {
    const now = Math.floor(Date.now() / 1000);
    patchPayload((p) => ({ ...p, iat: now, exp: now + seconds }));
  }

  function setIatNow() {
    const now = Math.floor(Date.now() / 1000);
    patchPayload((p) => ({ ...p, iat: now }));
  }

  function removeClaim(key: string) {
    patchPayload((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  }

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ algo, payload }),
        applyState: (s) => {
          const v = s as { algo?: Algo; payload?: string };
          if (v.algo && (ALGOS as readonly string[]).includes(v.algo)) setAlgo(v.algo);
          if (typeof v.payload === 'string') setPayload(v.payload);
        },
      }}
      actions={
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value as Algo)}
          className="input w-auto py-1.5"
          aria-label="JWT algorithm"
        >
          {ALGOS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      }
    >
      <div className="space-y-4">
        <label className="text-sm text-muted block">
          Secret (HMAC key)
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="input mt-1 font-mono"
            spellCheck={false}
            autoComplete="off"
            placeholder="At least 32 bytes recommended for HS256"
          />
        </label>

        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <label htmlFor="jwt-gen-payload" className="text-sm text-muted">
              Payload (JSON)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={setIatNow}
                disabled={!parsedPayload.ok}
                className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                title="Set iat = current Unix time"
              >
                iat = now
              </button>
              <button
                type="button"
                onClick={() => setExpFromNow(3600)}
                disabled={!parsedPayload.ok}
                className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                title="Set exp = now + 1 hour"
              >
                exp +1h
              </button>
              <button
                type="button"
                onClick={() => setExpFromNow(86_400)}
                disabled={!parsedPayload.ok}
                className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                title="Set exp = now + 24 hours"
              >
                +24h
              </button>
              <button
                type="button"
                onClick={() => setExpFromNow(7 * 86_400)}
                disabled={!parsedPayload.ok}
                className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                title="Set exp = now + 7 days"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => removeClaim('exp')}
                disabled={!parsedPayload.ok || !(parsedPayload.ok && 'exp' in parsedPayload.value)}
                className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                title="Remove exp claim"
              >
                clear exp
              </button>
            </div>
          </div>
          <textarea
            id="jwt-gen-payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea font-mono text-xs"
          />
          {!parsedPayload.ok ? (
            <p className="text-xs text-error mt-1 font-mono">
              {parsedPayload.error}
            </p>
          ) : null}
        </div>

        <div>
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
            Header (auto)
          </div>
          <OutputPane text={header} wrap copyLabel="Copy header" />
        </div>

        <div>
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
            Signed JWT
          </div>
          {result.ok && result.token ? (
            <OutputPane text={result.token} wrap copyLabel="Copy token">
              <ColoredToken token={result.token} />
            </OutputPane>
          ) : (
            <OutputPane
              text={result.error ?? ''}
              tone={result.error ? 'error' : 'default'}
              wrap
            >
              {result.error || (
                <span className="text-subtle">Token will appear here.</span>
              )}
            </OutputPane>
          )}
        </div>

        <p className="text-2xs text-subtle font-mono">
          Signed in your browser via WebCrypto HMAC-{algo.slice(2)}. The secret never leaves
          this tab. To verify the token server-side, use the same secret with your language&apos;s
          JWT library.
        </p>
      </div>
    </ToolFrame>
  );
}

function ColoredToken({ token }: { token: string }) {
  const parts = token.split('.');
  if (parts.length !== 3) return <>{token}</>;
  return (
    <>
      <span className="text-accent">{parts[0]}</span>
      <span className="text-subtle">.</span>
      <span className="text-cyan">{parts[1]}</span>
      <span className="text-subtle">.</span>
      <span className="text-muted">{parts[2]}</span>
    </>
  );
}
