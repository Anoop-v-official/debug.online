import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { copy } from '../lib/clipboard';

interface Props {
  /** The actual text to copy when the user clicks the corner button. */
  text: string;
  /**
   * Custom rendering inside the pane (e.g. styled spans, placeholder JSX).
   * If omitted, the pane just renders `text` directly.
   */
  children?: ReactNode;
  /** Use the wrapping `.pane-wrap` (whitespace-pre-wrap, break-all). */
  wrap?: boolean;
  /** Render the pane in error tone (red text). */
  tone?: 'default' | 'error';
  /** Extra classes appended to the pane. */
  className?: string;
  /** Override the copy button label / tooltip. */
  copyLabel?: string;
}

/**
 * A styled output pane (matches `.pane` / `.pane-wrap`) with a small
 * hover-revealed copy button in the top-right corner. Drop in anywhere a
 * tool used to render `<pre className="pane">…</pre>`.
 */
export function OutputPane({
  text,
  children,
  wrap = false,
  tone = 'default',
  className = '',
  copyLabel = 'Copy',
}: Props) {
  const [copied, setCopied] = useState(false);
  const hasContent = text.length > 0;

  async function onCopy() {
    if (!hasContent) return;
    const ok = await copy(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1100);
    }
  }

  const base = wrap ? 'pane-wrap' : 'pane';
  const toneClass = tone === 'error' ? 'text-error' : '';

  return (
    <div className="relative group">
      <pre className={`${base} ${toneClass} ${className}`.trim()}>{children ?? text}</pre>
      {hasContent ? (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? 'Copied' : copyLabel}
          title={copied ? 'Copied!' : copyLabel}
          className={`absolute top-2 right-2 inline-flex items-center justify-center
                      w-7 h-7 rounded-md border bg-surface/90 backdrop-blur transition-all
                      ${
                        copied
                          ? 'border-accent text-accent opacity-100'
                          : 'border-border text-subtle hover:text-accent hover:border-border-strong opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                      }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      ) : null}
    </div>
  );
}
