import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';
import { formatBytes } from '../lib/byteSize';

const tool = toolBySlug['image-to-base64']!;

interface Loaded {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

function readFile(f: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () =>
      resolve({
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        dataUrl: r.result as string,
      });
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });
}

export default function ImageToBase64() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handle(files: FileList | null) {
    setErr(null);
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      setErr('Files over 10 MB are not supported in the browser tool.');
      return;
    }
    try {
      setLoaded(await readFile(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed to read');
    }
  }

  const dataUrl = loaded?.dataUrl ?? '';
  const cssBg = dataUrl ? `background-image: url("${dataUrl}");` : '';
  const htmlImg = dataUrl ? `<img src="${dataUrl}" alt="" />` : '';

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-4">
        <label
          htmlFor="image-input"
          className="card p-8 flex flex-col items-center justify-center text-center cursor-pointer
                     hover:border-accent hover:bg-surface-2 transition-colors"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            handle(e.dataTransfer.files);
          }}
        >
          <span className="text-3xl mb-2">📁</span>
          <span className="text-sm text-text">Drop an image, or click to choose</span>
          <span className="text-2xs text-subtle font-mono mt-1">
            PNG · JPG · SVG · WebP · GIF · up to 10 MB
          </span>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handle(e.target.files)}
          />
        </label>

        {err ? <pre className="card p-3 text-xs font-mono text-error">{err}</pre> : null}

        {loaded ? (
          <>
            <div className="card p-3 flex items-center gap-3">
              <img src={dataUrl} alt={loaded.name} className="w-16 h-16 object-contain rounded border border-border" />
              <div className="text-xs font-mono space-y-0.5">
                <div className="text-text">{loaded.name}</div>
                <div className="text-subtle">
                  {loaded.type} · {formatBytes(loaded.size)} · base64 {formatBytes(dataUrl.length)}
                </div>
              </div>
            </div>

            <Block label="Data URL" value={dataUrl} />
            <Block label="HTML" value={htmlImg} />
            <Block label="CSS" value={cssBg} />
          </>
        ) : null}
      </div>
    </ToolFrame>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-2xs uppercase tracking-wide text-subtle font-mono">{label}</span>
        <CopyButton text={value} />
      </div>
      <pre className="text-xs font-mono break-all whitespace-pre-wrap max-h-40 overflow-auto">
        {value}
      </pre>
    </div>
  );
}
