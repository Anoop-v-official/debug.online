import { useEffect, useRef, useState } from 'react';
import { Check, Send, X } from 'lucide-react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function RequestToolModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset state when modal reopens.
  useEffect(() => {
    if (open) setStatus('idle');
  }, [open]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'request',
          text: text.trim(),
          email: email.trim(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
      setText('');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request a tool"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in"
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
        className="relative w-full max-w-md card overflow-hidden shadow-glow animate-slide-up focus:outline-none"
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-text">Request a tool</h2>
            <p className="text-2xs text-subtle font-mono">
              Tell us what is missing. We read every submission.
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

        {status === 'sent' ? (
          <div className="p-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-accent/40 bg-accent/10 text-accent">
              <Check className="w-5 h-5" aria-hidden />
            </div>
            <p className="text-sm text-text">Thanks — request received.</p>
            <p className="text-2xs text-subtle font-mono">
              Popular requests get built first. Check back in a week or two.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-3 h-8 rounded-md border border-border bg-surface text-muted text-xs hover:text-text"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-4 space-y-3">
            <label className="block text-xs text-muted">
              <span className="text-text">What would you build?</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={500}
                required
                spellCheck={false}
                placeholder="A GraphQL formatter, a kubectl YAML linter, a public-suffix-list lookup…"
                className="textarea mt-1 text-xs font-mono min-h-[100px]"
              />
              <span className="text-2xs text-subtle font-mono mt-0.5 inline-block">
                {text.length} / 500
              </span>
            </label>
            <label className="block text-xs text-muted">
              <span className="text-text">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="To notify you when it ships"
                className="input mt-1 text-xs"
                autoComplete="email"
              />
            </label>
            {status === 'error' ? (
              <p className="text-xs text-error">
                Could not send. Try again, or use the{' '}
                <a href="/contact" className="underline">
                  contact page
                </a>
                .
              </p>
            ) : null}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 h-9 rounded-md border border-border bg-surface text-muted text-sm hover:text-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim() || status === 'sending'}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border border-accent/40 bg-accent/10 text-accent text-sm hover:bg-accent/15 transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" aria-hidden />
                {status === 'sending' ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
