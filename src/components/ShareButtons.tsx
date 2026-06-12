import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { copy } from '../lib/clipboard';

const SITE = 'https://debugdaily.online';

export function ShareButtons({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}${path}`;
  const enc = encodeURIComponent;

  async function onCopy() {
    const ok = await copy(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <div
      className="flex items-center gap-2 text-xs font-mono text-subtle print:hidden"
      aria-label="Share this article"
    >
      <span className="text-2xs uppercase tracking-widest">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X / Twitter"
        title="Share on X / Twitter"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border bg-surface text-muted hover:text-accent hover:border-border-strong transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden
        >
          <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.84l-5.36-7.013L4.6 22H1.34l8.02-9.165L1 2h7.04l4.85 6.41L18.244 2zm-2.4 18h1.9L7.21 4H5.21l10.633 16z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border bg-surface text-muted hover:text-accent hover:border-border-strong transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden
        >
          <path d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.66H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      </a>
      <a
        href={`https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Submit to Hacker News"
        title="Submit to Hacker News"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border bg-surface text-muted hover:text-accent hover:border-border-strong transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden
        >
          <path d="M3 3h18v18H3V3zm9.42 10.55v4.79h-1.84v-4.79L7 7h2.18l2.32 4.5L13.82 7H16l-3.58 6.55z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy link'}
        title={copied ? 'Copied!' : 'Copy link'}
        className={
          'inline-flex items-center justify-center w-7 h-7 rounded-md border transition-colors ' +
          (copied
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border bg-surface text-muted hover:text-accent hover:border-border-strong')
        }
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
