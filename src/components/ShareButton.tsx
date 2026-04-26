import { useState } from 'react';
import { copy } from '../lib/clipboard';

export function ShareButton({
  toolSlug,
  state,
}: {
  toolSlug: string;
  state: unknown;
}) {
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState('Share');

  async function onClick() {
    setBusy(true);
    setLabel('…');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tool: toolSlug, state }),
      });
      if (!res.ok) throw new Error('share failed');
      const { id } = (await res.json()) as { id: string };
      const url = `${window.location.origin}/tools/${toolSlug}?s=${encodeURIComponent(id)}`;
      const ok = await copy(url);
      setLabel(ok ? 'Copied!' : url);
    } catch {
      setLabel('Failed');
    } finally {
      setBusy(false);
      window.setTimeout(() => setLabel('Share'), 1800);
    }
  }

  return (
    <button type="button" className="btn" onClick={onClick} disabled={busy}>
      {label}
    </button>
  );
}
