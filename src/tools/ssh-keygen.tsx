import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['ssh-keygen']!;

function pem(label: string, derBase64: string): string {
  const wrapped = derBase64.match(/.{1,64}/g)?.join('\n') ?? derBase64;
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----\n`;
}

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function intToBytes(big: bigint): Uint8Array {
  const hex = big.toString(16);
  const padded = hex.length % 2 ? '0' + hex : hex;
  const bytes = new Uint8Array(padded.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  // SSH wire format requires a leading 0x00 if MSB is set.
  if (bytes[0] & 0x80) {
    const out = new Uint8Array(bytes.length + 1);
    out.set(bytes, 1);
    return out;
  }
  return bytes;
}

function pack(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + 4 + p.length, 0);
  const out = new Uint8Array(total);
  let i = 0;
  for (const p of parts) {
    out[i++] = (p.length >>> 24) & 0xff;
    out[i++] = (p.length >>> 16) & 0xff;
    out[i++] = (p.length >>> 8) & 0xff;
    out[i++] = p.length & 0xff;
    out.set(p, i);
    i += p.length;
  }
  return out;
}

async function rsaPublicSshFormat(jwk: JsonWebKey, comment: string): Promise<string> {
  if (!jwk.n || !jwk.e) throw new Error('missing modulus/exponent');
  const n = BigInt('0x' + Buffer.from(jwk.n, 'base64').toString('hex'));
  const e = BigInt('0x' + Buffer.from(jwk.e, 'base64').toString('hex'));
  const algo = new TextEncoder().encode('ssh-rsa');
  const blob = pack([algo, intToBytes(e), intToBytes(n)]);
  const b64 = bufToBase64(blob);
  return `ssh-rsa ${b64} ${comment}\n`;
}

const Buffer = {
  from(s: string, encoding: 'base64'): { toString(enc: 'hex'): string } {
    void encoding;
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    let hex = '';
    for (let i = 0; i < bin.length; i++) {
      hex += bin.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return {
      toString() {
        return hex;
      },
    };
  },
};

export default function SshKeygen() {
  const [bits, setBits] = useState<2048 | 3072 | 4096>(4096);
  const [comment, setComment] = useState('user@debugdaily');
  const [busy, setBusy] = useState(false);
  const [pub, setPub] = useState('');
  const [priv, setPriv] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const pair = await crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: bits,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify'],
      );
      const privPkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
      const pubJwk = (await crypto.subtle.exportKey('jwk', pair.publicKey)) as JsonWebKey;
      setPriv(pem('PRIVATE KEY', bufToBase64(privPkcs8)));
      setPub(await rsaPublicSshFormat(pubJwk, comment));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'key generation failed');
    } finally {
      setBusy(false);
    }
  }

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <ToolFrame
      tool={tool}
      actions={
        <button type="button" className="btn-accent" onClick={generate} disabled={busy}>
          {busy ? 'Generating…' : 'Generate keys'}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm text-muted">
            Algorithm
            <select
              value={String(bits)}
              onChange={(e) => setBits(Number(e.target.value) as 2048 | 3072 | 4096)}
              className="input mt-1"
            >
              <option value="2048">RSA 2048</option>
              <option value="3072">RSA 3072</option>
              <option value="4096">RSA 4096 (recommended)</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Comment
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input mt-1 font-mono"
            />
          </label>
        </div>

        {err ? <pre className="card p-3 text-xs font-mono text-error">{err}</pre> : null}

        {pub ? (
          <Block
            title="Public key (paste into ~/.ssh/authorized_keys)"
            value={pub}
            filename="id_rsa.pub"
            onDownload={download}
          />
        ) : null}
        {priv ? (
          <Block
            title="Private key (PKCS#8 PEM — keep secret!)"
            value={priv}
            filename="id_rsa"
            onDownload={download}
            secret
          />
        ) : null}

        <p className="text-2xs text-subtle font-mono">
          Generation runs in your browser via WebCrypto. Nothing is uploaded. Newer setups should prefer Ed25519, which most browsers don't yet expose for export — RSA-4096 remains widely accepted.
        </p>
      </div>
    </ToolFrame>
  );
}

function Block({
  title,
  value,
  filename,
  onDownload,
  secret,
}: {
  title: string;
  value: string;
  filename: string;
  onDownload: (n: string, c: string) => void;
  secret?: boolean;
}) {
  return (
    <div className={`card p-3 space-y-2 ${secret ? 'border-warning/40' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs uppercase tracking-wide text-subtle font-mono">{title}</span>
        <div className="flex items-center gap-2">
          <button type="button" className="btn" onClick={() => onDownload(filename, value)}>
            Download
          </button>
          <CopyButton text={value} />
        </div>
      </div>
      <pre className="text-xs font-mono break-all whitespace-pre-wrap max-h-60 overflow-auto">
        {value}
      </pre>
    </div>
  );
}
