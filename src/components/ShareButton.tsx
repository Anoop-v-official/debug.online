import { useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { copy } from '../lib/clipboard';
import { createShare } from '../lib/shareClient';

type Status = 'idle' | 'creating' | 'copied' | 'error';

export function ShareButton({
  toolSlug,
  getState,
}: {
  toolSlug: string;
  getState: () => unknown;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onClick() {
    if (status === 'creating') return;
    setStatus('creating');
    setErrMsg(null);
    try {
      const id = await createShare(toolSlug, getState());
      const url = `${window.location.origin}/tools/${toolSlug}?s=${encodeURIComponent(id)}`;
      const ok = await copy(url);
      setStatus(ok ? 'copied' : 'error');
      if (!ok) setErrMsg(url);
      window.setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setStatus('error');
      setErrMsg(e instanceof Error ? e.message : 'share failed');
      window.setTimeout(() => setStatus('idle'), 3000);
    }
  }

  const label =
    status === 'creating'
      ? 'Sharing…'
      : status === 'copied'
        ? 'Link copied!'
        : status === 'error'
          ? 'Failed'
          : 'Share';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn ${status === 'copied' ? 'border-accent text-accent' : ''}`}
      aria-label="Create a shareable link to this tool's current state"
      title={errMsg ?? 'Copy a link that recreates this state'}
      disabled={status === 'creating'}
    >
      {status === 'copied' ? (
        <Check className="w-4 h-4" aria-hidden />
      ) : (
        <LinkIcon className="w-4 h-4" aria-hidden />
      )}
      {label}
    </button>
  );
}
