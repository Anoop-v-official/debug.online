import { useState } from 'react';
import bcrypt from 'bcryptjs';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['bcrypt-tester']!;

export default function BcryptTester() {
  const [mode, setMode] = useState<'hash' | 'verify'>('hash');
  const [password, setPassword] = useState('correct horse battery staple');
  const [rounds, setRounds] = useState(10);
  const [hashed, setHashed] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<'idle' | 'match' | 'no-match' | 'error'>('idle');
  const [busy, setBusy] = useState(false);

  async function doHash() {
    setBusy(true);
    try {
      const salt = await bcrypt.genSalt(rounds);
      const h = await bcrypt.hash(password, salt);
      setHashed(h);
    } finally {
      setBusy(false);
    }
  }

  async function doVerify() {
    setVerifyResult('idle');
    try {
      const ok = await bcrypt.compare(password, verifyHash);
      setVerifyResult(ok ? 'match' : 'no-match');
    } catch {
      setVerifyResult('error');
    }
  }

  return (
    <ToolFrame
      tool={tool}
      actions={
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(['hash', 'verify'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`px-3 py-1.5 text-xs ${mode === m ? 'bg-surface-2 text-text' : 'text-muted'}`}
              onClick={() => setMode(m)}
            >
              {m === 'hash' ? 'Hash' : 'Verify'}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        <label className="text-sm text-muted block">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1 font-mono"
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        {mode === 'hash' ? (
          <>
            <label className="text-sm text-muted flex items-center gap-3">
              <span className="w-28">Cost (rounds)</span>
              <input
                type="range"
                min={4}
                max={14}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="w-12 text-right font-mono text-text">{rounds}</span>
            </label>
            <p className="text-2xs text-subtle font-mono">
              Each +1 doubles compute cost. 10 ≈ 100 ms, 14 ≈ 1.6 s in browser. Production typical: 10–12.
            </p>
            <button type="button" onClick={doHash} className="btn-accent" disabled={busy}>
              {busy ? 'Hashing…' : 'Generate hash'}
            </button>
            {hashed ? (
              <div className="card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs uppercase tracking-wide text-subtle font-mono">Hash</span>
                  <CopyButton text={hashed} />
                </div>
                <pre className="text-xs font-mono break-all whitespace-pre-wrap">{hashed}</pre>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <label className="text-sm text-muted block">
              Existing hash
              <textarea
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                rows={3}
                spellCheck={false}
                className="textarea mt-1 font-mono text-xs min-h-0"
                placeholder="$2a$10$..."
              />
            </label>
            <button type="button" onClick={doVerify} className="btn-accent" disabled={!verifyHash || !password}>
              Verify
            </button>
            {verifyResult === 'match' ? (
              <div className="card p-3 text-sm border-accent/40 bg-accent/5 text-accent">
                ✓ Password matches the hash.
              </div>
            ) : verifyResult === 'no-match' ? (
              <div className="card p-3 text-sm border-error/40 bg-error/5 text-error">
                ✕ Password does NOT match.
              </div>
            ) : verifyResult === 'error' ? (
              <div className="card p-3 text-sm text-error">Could not parse the hash.</div>
            ) : null}
          </>
        )}
      </div>
    </ToolFrame>
  );
}
