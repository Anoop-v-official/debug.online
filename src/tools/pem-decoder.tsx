import { useEffect, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['pem-decoder']!;

interface Decoded {
  subject: string;
  issuer: string;
  serial: string;
  notBefore: string;
  notAfter: string;
  daysLeft: number;
  sigAlgo: string;
  publicKey: string;
  san: string[];
  fingerprintSha1: string;
  fingerprintSha256: string;
  selfSigned: boolean;
  expired: boolean;
}

const SAMPLE_HINT = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUbsCpUR…
... base64 of DER bytes ...
-----END CERTIFICATE-----`;

function bytesToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

function formatDate(d: Date): string {
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

async function decode(pemOrDer: string): Promise<Decoded> {
  const { X509Certificate } = await import('@peculiar/x509');
  const trimmed = pemOrDer.trim();
  if (!trimmed) throw new Error('Paste a certificate to decode.');
  const cert = new X509Certificate(trimmed);
  const raw = cert.rawData;

  const subject = cert.subject;
  const issuer = cert.issuer;
  const selfSigned = subject === issuer;
  const notBefore = cert.notBefore;
  const notAfter = cert.notAfter;
  const now = new Date();
  const daysLeft = Math.round((notAfter.getTime() - now.getTime()) / 86_400_000);
  const expired = notAfter < now;
  const sigAlgo = cert.signatureAlgorithm.name + (
    'hash' in cert.signatureAlgorithm
      ? ` with ${(cert.signatureAlgorithm as { hash: { name: string } }).hash.name}`
      : ''
  );

  // Extract SAN if present
  let san: string[] = [];
  const sanExt = cert.getExtension('2.5.29.17');
  if (sanExt) {
    const text = sanExt.toString();
    san = text
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p && !/^subject\s*alternative\s*name/i.test(p));
  }

  // Public key — show type and size
  const pk = cert.publicKey;
  let publicKey = pk.algorithm.name;
  if ('modulusLength' in pk.algorithm) {
    publicKey += ` ${(pk.algorithm as { modulusLength: number }).modulusLength} bits`;
  } else if ('namedCurve' in pk.algorithm) {
    publicKey += ` (${(pk.algorithm as { namedCurve: string }).namedCurve})`;
  }

  const [sha1, sha256] = await Promise.all([
    crypto.subtle.digest('SHA-1', raw),
    crypto.subtle.digest('SHA-256', raw),
  ]);

  return {
    subject,
    issuer,
    serial: cert.serialNumber.toUpperCase(),
    notBefore: formatDate(notBefore),
    notAfter: formatDate(notAfter),
    daysLeft,
    sigAlgo,
    publicKey,
    san,
    fingerprintSha1: bytesToHex(sha1),
    fingerprintSha256: bytesToHex(sha256),
    selfSigned,
    expired,
  };
}

export default function PemDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }
    let cancelled = false;
    decode(input)
      .then((d) => {
        if (cancelled) return;
        setDecoded(d);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setDecoded(null);
        setError(e instanceof Error ? e.message : 'Failed to decode certificate.');
      });
    return () => {
      cancelled = true;
    };
  }, [input]);

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
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder={SAMPLE_HINT}
          className="textarea font-mono text-xs"
        />

        {error ? (
          <OutputPane text={error} tone="error" wrap />
        ) : decoded ? (
          <div className="space-y-3">
            {decoded.expired ? (
              <div className="card p-3 border-error/50 bg-error/5 text-sm text-error">
                Certificate is expired — ended {decoded.notAfter}.
              </div>
            ) : decoded.daysLeft <= 30 ? (
              <div className="card p-3 border-warning/50 bg-warning/5 text-sm text-warning">
                Expires in {decoded.daysLeft} days.
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Subject" value={decoded.subject} />
              <Field
                label={`Issuer${decoded.selfSigned ? ' (self-signed)' : ''}`}
                value={decoded.issuer}
              />
              <Field label="Serial number" value={decoded.serial} mono />
              <Field label="Signature algorithm" value={decoded.sigAlgo} />
              <Field label="Public key" value={decoded.publicKey} />
              <Field
                label="Validity"
                value={`${decoded.notBefore}\n→ ${decoded.notAfter}\n(${decoded.daysLeft} days remaining)`}
              />
            </div>

            {decoded.san.length > 0 ? (
              <Field
                label="Subject alternative names"
                value={decoded.san.join('\n')}
                mono
              />
            ) : null}

            <Field
              label="Fingerprint (SHA-256)"
              value={decoded.fingerprintSha256}
              mono
              small
            />
            <Field
              label="Fingerprint (SHA-1)"
              value={decoded.fingerprintSha1}
              mono
              small
            />
          </div>
        ) : (
          <p className="text-sm text-subtle">
            Paste a PEM-encoded X.509 certificate above to inspect it.
          </p>
        )}
      </div>
    </ToolFrame>
  );
}

function Field({
  label,
  value,
  mono = false,
  small = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
        {label}
      </div>
      <OutputPane
        text={value}
        wrap
        className={`${mono ? 'font-mono' : ''} ${small ? 'text-2xs' : 'text-xs'}`}
      />
    </div>
  );
}
