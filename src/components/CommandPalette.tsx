import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Star } from 'lucide-react';
import { type Tool, categoryLabels, toolBySlug } from '../lib/tools';
import { useHistoryStore } from '../store/history';
import { useFavoritesStore } from '../store/favorites';

interface Section {
  label: string;
  icon: typeof Clock | null;
  tools: Tool[];
}

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

  const historyEntries = useHistoryStore((s) => s.entries);
  const favoriteSlugs = useFavoritesStore((s) => s.slugs);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // When the query is empty, group by Recent / Favorites / All. When the user
  // starts typing, collapse to a single filtered list.
  const sections: Section[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const filtered = items.filter((t) => {
        const hay = [t.name, t.description, ...t.keywords].join(' ').toLowerCase();
        return hay.includes(q);
      });
      return [{ label: 'Results', icon: null, tools: filtered }];
    }

    const recentTools = historyEntries
      .map((e) => toolBySlug[e.slug])
      .filter((t): t is Tool => !!t)
      .slice(0, 5);

    const favoriteTools = favoriteSlugs
      .map((slug) => toolBySlug[slug])
      .filter((t): t is Tool => !!t)
      .filter((t) => !recentTools.includes(t))
      .slice(0, 5);

    const usedSlugs = new Set([
      ...recentTools.map((t) => t.slug),
      ...favoriteTools.map((t) => t.slug),
    ]);
    const rest = items.filter((t) => !usedSlugs.has(t.slug));

    const out: Section[] = [];
    if (recentTools.length > 0) {
      out.push({ label: 'Recent', icon: Clock, tools: recentTools });
    }
    if (favoriteTools.length > 0) {
      out.push({ label: 'Favorites', icon: Star, tools: favoriteTools });
    }
    out.push({ label: 'All tools', icon: null, tools: rest });
    return out;
  }, [items, query, historyEntries, favoriteSlugs]);

  // Flat list to support arrow-key navigation across sections.
  const flat = useMemo(() => sections.flatMap((s) => s.tools), [sections]);

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
                setActive((i) => Math.min(i + 1, flat.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const t = flat[active];
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
        <div className="max-h-80 overflow-y-auto py-1">
          {flat.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-subtle">No matches.</div>
          ) : (
            sections.map((section, sectionIdx) => {
              if (section.tools.length === 0) return null;
              const Icon = section.icon;
              const startIdx = sections
                .slice(0, sectionIdx)
                .reduce((sum, s) => sum + s.tools.length, 0);
              return (
                <div key={section.label} className="py-1">
                  <div className="px-4 pt-1 pb-0.5 flex items-center gap-1.5 text-2xs uppercase tracking-widest font-mono text-subtle">
                    {Icon ? <Icon className="w-3 h-3" aria-hidden /> : null}
                    {section.label}
                  </div>
                  <ul>
                    {section.tools.map((t, i) => {
                      const flatIdx = startIdx + i;
                      const isActive = flatIdx === active;
                      return (
                        <li key={t.slug}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(flatIdx)}
                            onClick={() => onSelect(t.slug)}
                            className={
                              'w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-sm ' +
                              (isActive
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
                            <span className="chip shrink-0">
                              {categoryLabels[t.category]}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
