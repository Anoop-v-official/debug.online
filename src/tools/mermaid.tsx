import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { copy } from '../lib/clipboard';

const tool = toolBySlug['mermaid']!;

const SAMPLES = {
  flowchart: `flowchart TD
  A[User opens site] --> B{Logged in?}
  B -- Yes --> C[Show dashboard]
  B -- No  --> D[Show landing]
  C --> E[Done]
  D --> E`,
  sequence: `sequenceDiagram
  participant Browser
  participant API
  participant DB
  Browser->>API: POST /login
  API->>DB: SELECT user WHERE email=?
  DB-->>API: row
  API-->>Browser: 200 + JWT`,
  class: `classDiagram
  class User {
    +id: UUID
    +email: string
    +login()
  }
  class Session {
    +token: string
    +expiresAt: Date
  }
  User "1" --> "*" Session`,
  state: `stateDiagram-v2
  [*] --> Draft
  Draft --> Review: submit
  Review --> Published: approve
  Review --> Draft: changes requested
  Published --> [*]`,
  er: `erDiagram
  USER ||--o{ POST : writes
  USER {
    uuid id
    string email
  }
  POST {
    uuid id
    string title
    uuid author_id
  }`,
  gantt: `gantt
  title Release plan
  dateFormat YYYY-MM-DD
  section Build
  Spec       :a1, 2026-01-01, 7d
  Implement  :a2, after a1, 14d
  section Ship
  QA         :b1, after a2, 5d
  Release    :milestone, after b1, 0d`,
  pie: `pie title Time spent debugging
  "Reading logs" : 45
  "Reading code" : 30
  "Typing fixes" : 10
  "Drinking coffee" : 15`,
} as const;

type SampleKey = keyof typeof SAMPLES;

interface RenderOk {
  ok: true;
  svg: string;
}
interface RenderErr {
  ok: false;
  error: string;
}
type RenderState = RenderOk | RenderErr | null;

export default function MermaidTool() {
  const [src, setSrc] = useState<string>(SAMPLES.flowchart);
  const [state, setState] = useState<RenderState>(null);
  const idRef = useRef(0);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const id = ++idRef.current;
      try {
        const mermaid = (await import('mermaid')).default;
        if (id !== idRef.current) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            background: '#0f0f15',
            primaryColor: '#15151c',
            primaryTextColor: '#ededed',
            primaryBorderColor: '#383842',
            lineColor: '#9a9aa5',
            secondaryColor: '#1a1a22',
            tertiaryColor: '#0a0a0f',
          },
          securityLevel: 'strict',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        });
        const parseOk = await mermaid.parse(src, { suppressErrors: true });
        if (!parseOk) {
          if (id !== idRef.current) return;
          setState({ ok: false, error: 'Diagram syntax error.' });
          return;
        }
        const { svg } = await mermaid.render(`mmd-${id}`, src);
        if (id !== idRef.current) return;
        setState({ ok: true, svg });
      } catch (e) {
        if (id !== idRef.current) return;
        setState({
          ok: false,
          error: e instanceof Error ? e.message : 'Render failed.',
        });
      }
    }, 200);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [src]);

  function loadSample(key: SampleKey) {
    setSrc(SAMPLES[key]);
  }

  function downloadSvg() {
    if (!state?.ok) return;
    const blob = new Blob([state.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPng() {
    if (!state?.ok) return;
    const img = new Image();
    const svgBlob = new Blob([state.svg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load SVG.'));
        img.src = svgUrl;
      });
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = (img.naturalWidth || 800) * scale;
      canvas.height = (img.naturalHeight || 600) * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable.');
      ctx.fillStyle = '#0f0f15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  async function copySvg() {
    if (!state?.ok) return;
    await copy(state.svg);
  }

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ src }),
        applyState: (s) => {
          const v = s as { src?: string };
          if (typeof v.src === 'string') setSrc(v.src);
        },
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SAMPLES) as SampleKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => loadSample(k)}
              className="chip hover:border-accent hover:text-accent transition-colors"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-1.5">
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
              Source
            </div>
            <textarea
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              rows={18}
              spellCheck={false}
              className="textarea font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
                Preview
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={copySvg}
                  disabled={!state?.ok}
                  className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                >
                  Copy SVG
                </button>
                <button
                  type="button"
                  onClick={downloadSvg}
                  disabled={!state?.ok}
                  className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" aria-hidden />
                  SVG
                </button>
                <button
                  type="button"
                  onClick={downloadPng}
                  disabled={!state?.ok}
                  className="chip hover:border-accent hover:text-accent transition-colors disabled:opacity-40 inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" aria-hidden />
                  PNG
                </button>
              </div>
            </div>
            <div className="card p-4 min-h-[420px] flex items-center justify-center overflow-auto">
              {state?.ok ? (
                <div
                  className="mermaid-preview w-full"
                  // mermaid output is sanitized by securityLevel:'strict'
                  dangerouslySetInnerHTML={{ __html: state.svg }}
                />
              ) : state ? (
                <pre className="text-xs text-error font-mono whitespace-pre-wrap">
                  {state.error}
                </pre>
              ) : (
                <span className="text-subtle text-sm">Rendering…</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-2xs text-subtle font-mono">
          Mermaid renders in your browser. Source and rendered SVG never leave the tab.
        </p>
      </div>
    </ToolFrame>
  );
}
