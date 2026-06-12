import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { type Tool } from '../lib/tools';
import { copy } from '../lib/clipboard';

const SITE = 'https://debugdaily.online';

type EmbedKind = 'iframe' | 'script';

export function EmbedModal({
  open,
  onClose,
  tool,
}: {
  open: boolean;
  onClose: () => void;
  tool: Tool;
}) {
  const [kind, setKind] = useState<EmbedKind>('script');
  const [height, setHeight] = useState(640);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape, focus the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const iframeSnippet = `<iframe
  src="${SITE}/embed/${tool.slug}"
  width="100%"
  height="${height}"
  loading="lazy"
  style="border:0;border-radius:8px;max-width:100%"
  title="${tool.name} · debugdaily"
></iframe>`;

  const scriptSnippet = `<script
  src="${SITE}/embed.js"
  data-debugdaily-embed
  data-tool="${tool.slug}"
  data-height="${height}"
  async
></script>`;

  const snippet = kind === 'iframe' ? iframeSnippet : scriptSnippet;
  const previewUrl = `${SITE}/embed/${tool.slug}`;

  async function onCopy() {
    const ok = await copy(snippet);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Embed this tool"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 animate-fade-in"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl card overflow-hidden shadow-glow animate-slide-up focus:outline-none"
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-text">
              Embed {tool.name}
            </h2>
            <p className="text-2xs text-subtle font-mono">
              Drop the snippet into any HTML page. It loads only when the page
              loads, runs in a sandboxed iframe.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-subtle hover:text-text"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setKind('script')}
                className={
                  'px-3 py-1.5 text-xs font-mono transition-colors ' +
                  (kind === 'script'
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-text')
                }
              >
                Script (auto-resize)
              </button>
              <button
                type="button"
                onClick={() => setKind('iframe')}
                className={
                  'px-3 py-1.5 text-xs font-mono transition-colors border-l border-border ' +
                  (kind === 'iframe'
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-text')
                }
              >
                Plain iframe
              </button>
            </div>

            <label className="ml-auto flex items-center gap-2 text-xs text-muted">
              <span>Height</span>
              <input
                type="number"
                min={300}
                max={2000}
                step={20}
                value={height}
                onChange={(e) =>
                  setHeight(Math.max(300, Math.min(2000, Number(e.target.value) || 640)))
                }
                className="input w-24 py-1 px-2 text-xs"
              />
              <span className="text-subtle font-mono">px</span>
            </label>
          </div>

          <div className="relative">
            <pre className="pane-wrap text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto">
              {snippet}
            </pre>
            <button
              type="button"
              onClick={onCopy}
              aria-label={copied ? 'Copied' : 'Copy snippet'}
              className={
                'absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-md border transition-all ' +
                (copied
                  ? 'border-accent text-accent bg-surface/90'
                  : 'border-border text-subtle bg-surface/90 hover:text-accent hover:border-border-strong')
              }
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="text-2xs uppercase tracking-wide font-mono text-subtle">
              Preview
            </div>
            <div className="rounded-md border border-border overflow-hidden bg-bg">
              <iframe
                src={previewUrl}
                width="100%"
                height={Math.min(height, 420)}
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                title={`${tool.name} embed preview`}
              />
            </div>
          </div>

          <ul className="text-2xs font-mono text-subtle space-y-1 pt-2 border-t border-border">
            <li>
              <span className="text-text">Script tag</span> creates the iframe
              and auto-resizes it to fit content. Recommended.
            </li>
            <li>
              <span className="text-text">Plain iframe</span> works anywhere
              that allows iframes (Notion, Ghost, WordPress) but uses a fixed
              height.
            </li>
            <li>
              Free forever. Attribution links back to debugdaily — please keep
              it visible.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
