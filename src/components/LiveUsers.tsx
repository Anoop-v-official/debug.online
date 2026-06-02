import { usePresence } from '../lib/presence';

export function LiveUsers() {
  const { count } = usePresence();
  if (count <= 0) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`${count} ${count === 1 ? 'user' : 'users'} online`}
      title={`${count} ${count === 1 ? 'user' : 'users'} online`}
      className="hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-border bg-surface text-xs text-muted"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="tabular-nums text-text">{count}</span>
      <span>live</span>
    </span>
  );
}
