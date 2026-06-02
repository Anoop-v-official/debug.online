import { usePresence } from '../lib/presence';

export function TotalVisits() {
  const { total, ready } = usePresence();
  if (!ready || total <= 0) return null;

  return (
    <span
      className="font-mono text-subtle"
      title="Total unique visits"
      aria-label={`${total.toLocaleString()} total visits`}
    >
      <span className="tabular-nums text-text">{total.toLocaleString()}</span>{' '}
      visits
    </span>
  );
}
