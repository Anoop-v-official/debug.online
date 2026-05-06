import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['qr-code-generator']!;

const ECC_LEVELS = ['L', 'M', 'Q', 'H'] as const;
type Ecc = (typeof ECC_LEVELS)[number];

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://debugdaily.online');
  const [size, setSize] = useState(320);
  const [ecc, setEcc] = useState<Ecc>('M');
  const [fg, setFg] = useState('#ededed');
  const [bg, setBg] = useState('#0a0a0f');
  const [dataUrl, setDataUrl] = useState('');
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text) {
      setDataUrl('');
      setSvg('');
      setErr(null);
      return;
    }
    let cancelled = false;
    const opts = {
      errorCorrectionLevel: ecc,
      width: size,
      margin: 2,
      color: { dark: fg, light: bg },
    };
    QRCode.toDataURL(text, opts)
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setErr(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'failed');
      });
    QRCode.toString(text, { ...opts, type: 'svg' })
      .then((s) => {
        if (!cancelled) setSvg(s);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, ecc, fg, bg]);

  function download(filename: string, content: string, type: string) {
    let url: string;
    if (content.startsWith('data:')) {
      url = content;
    } else {
      const blob = new Blob([content], { type });
      url = URL.createObjectURL(blob);
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    if (!content.startsWith('data:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <ToolFrame tool={tool}>
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-3">
          <label className="text-sm text-muted block">
            Content
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              spellCheck={false}
              className="textarea mt-1 font-mono text-xs min-h-0"
            />
          </label>
          <label className="text-sm text-muted block">
            Size · {size}px
            <input
              type="range"
              min={128}
              max={1024}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-accent mt-1"
            />
          </label>
          <label className="text-sm text-muted block">
            Error correction
            <select
              value={ecc}
              onChange={(e) => setEcc(e.target.value as Ecc)}
              className="input mt-1"
            >
              <option value="L">L · 7%</option>
              <option value="M">M · 15%</option>
              <option value="Q">Q · 25%</option>
              <option value="H">H · 30%</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted block">
              Foreground
              <input
                type="color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                className="w-full h-9 rounded border border-border bg-transparent cursor-pointer mt-1"
              />
            </label>
            <label className="text-xs text-muted block">
              Background
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="w-full h-9 rounded border border-border bg-transparent cursor-pointer mt-1"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => download('qr.png', dataUrl, 'image/png')}
              disabled={!dataUrl}
            >
              Download PNG
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => download('qr.svg', svg, 'image/svg+xml')}
              disabled={!svg}
            >
              Download SVG
            </button>
            <CopyButton text={dataUrl} label="Copy data URL" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-center min-h-[320px]">
          {err ? (
            <pre className="text-xs font-mono text-error">{err}</pre>
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt="QR code"
              className="max-w-full max-h-[480px]"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <span className="text-subtle text-sm">Enter content to generate.</span>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </ToolFrame>
  );
}
