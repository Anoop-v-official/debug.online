import { useState } from 'react';
import { copy } from '../lib/clipboard';

export function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        const ok = await copy(text);
        setDone(ok);
        window.setTimeout(() => setDone(false), 1200);
      }}
      disabled={!text}
    >
      {done ? 'Copied!' : label}
    </button>
  );
}
