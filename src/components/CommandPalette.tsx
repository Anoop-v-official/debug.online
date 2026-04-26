import { useEffect, useMemo, useRef, useState } from 'react';
import { type Tool, categoryLabels } from '../lib/tools';

export function CommandPalette({
  open,
  onClose,
  items,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  items: Tool[];
  onSelect: (slug: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => {
      const hay = [t.name, t.description, ...t.keywords].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 animate-fade-in"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl card overflow-hidden shadow-glow animate-slide-up">
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <span className="text-subtle font-mono text-sm">/</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const t = filtered[active];
                if (t) onSelect(t.slug);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Search tools…"
            className="flex-1 bg-transparent py-3 outline-none text-sm placeholder:text-subtle"
          />
          <span className="kbd">esc</span>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-subtle">No matches.</li>
          ) : (
            filtered.map((t, i) => (
              <li key={t.slug}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => onSelect(t.slug)}
                  className={
                    'w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-sm ' +
                    (i === active
                      ? 'bg-surface-2 text-text'
                      : 'text-muted hover:text-text')
                  }
                >
                  <span className="flex flex-col min-w-0">
                    <span className="truncate text-text">{t.name}</span>
                    <span className="truncate text-2xs text-subtle">
                      {t.description}
                    </span>
                  </span>
                  <span className="chip shrink-0">{categoryLabels[t.category]}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
