import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['wifi-qr']!;

type Enc = 'WPA' | 'WEP' | 'nopass';

// Escape per the Wi-Fi QR spec: \ ; , : "
function escapeField(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1');
}

function buildPayload(ssid: string, password: string, enc: Enc, hidden: boolean): string {
  if (!ssid) return '';
  const T = enc === 'nopass' ? 'nopass' : enc;
  const P = enc === 'nopass' ? '' : `P:${escapeField(password)};`;
  return `WIFI:T:${T};S:${escapeField(ssid)};${P}H:${hidden ? 'true' : 'false'};;`;
}

export default function WifiQr() {
  const [ssid, setSsid] = useState('My Home Wi-Fi');
  const [password, setPassword] = useState('correct horse battery staple');
  const [enc, setEnc] = useState<Enc>('WPA');
  const [hidden, setHidden] = useState(false);

  const payload = useMemo(() => buildPayload(ssid, password, enc, hidden), [ssid, password, enc, hidden]);

  const [dataUrl, setDataUrl] = useState('');
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!payload) {
      setDataUrl('');
      setSvg('');
      return;
    }
    const opts = {
      errorCorrectionLevel: 'M' as const,
      width: 360,
      margin: 2,
      color: { dark: '#ededed', light: '#0a0a0f' },
    };
    QRCode.toDataURL(payload, opts).then((u) => !cancelled && setDataUrl(u));
    QRCode.toString(payload, { ...opts, type: 'svg' }).then((s) => !cancelled && setSvg(s));
    return () => {
      cancelled = true;
    };
  }, [payload]);

  function download(filename: string, content: string, type: string) {
    let url: string;
    if (content.startsWith('data:')) {
      url = content;
    } else {
      url = URL.createObjectURL(new Blob([content], { type }));
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    if (!content.startsWith('data:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ ssid, enc, hidden }),
        applyState: (s) => {
          const v = s as { ssid?: string; enc?: Enc; hidden?: boolean };
          if (typeof v.ssid === 'string') setSsid(v.ssid);
          if (v.enc === 'WPA' || v.enc === 'WEP' || v.enc === 'nopass') setEnc(v.enc);
          if (typeof v.hidden === 'boolean') setHidden(v.hidden);
        },
      }}
    >
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-3">
          <label className="text-sm text-muted block">
            Network name (SSID)
            <input
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="input mt-1 font-mono"
              spellCheck={false}
            />
          </label>
          <label className="text-sm text-muted block">
            Encryption
            <select
              value={enc}
              onChange={(e) => setEnc(e.target.value as Enc)}
              className="input mt-1"
            >
              <option value="WPA">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP (legacy)</option>
              <option value="nopass">No password</option>
            </select>
          </label>
          {enc !== 'nopass' ? (
            <label className="text-sm text-muted block">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1 font-mono"
                spellCheck={false}
                autoComplete="off"
              />
            </label>
          ) : null}
          <label className="text-xs text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="accent-accent"
            />
            Hidden network
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="btn"
              onClick={() => download('wifi.png', dataUrl, 'image/png')}
              disabled={!dataUrl}
            >
              Download PNG
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => download('wifi.svg', svg, 'image/svg+xml')}
              disabled={!svg}
            >
              Download SVG
            </button>
          </div>
        </div>

        <div className="card p-4 flex items-center justify-center min-h-[320px]">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Wi-Fi QR code"
              className="max-w-full max-h-[480px]"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <span className="text-subtle text-sm">Enter a network name to generate.</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
          Wi-Fi payload string
        </div>
        <OutputPane text={payload} wrap copyLabel="Copy payload" />
      </div>

      <p className="text-2xs text-subtle font-mono mt-3">
        Standard WIFI: URI format. iOS Camera and modern Android scan this directly and prompt to join the network — no app needed.
      </p>
    </ToolFrame>
  );
}
