import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { type Tool, categoryLabels } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';

export function ToolFrame({
  tool,
  actions,
  children,
}: {
  tool: Tool;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const fav = useFavoritesStore((s) => s.slugs.includes(tool.slug));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-2xs text-subtle font-mono mb-1">
            <Link to="/" className="hover:text-text">
              ← back
            </Link>
            <span>·</span>
            <span className="chip">{categoryLabels[tool.category]}</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {tool.name}
            <button
              type="button"
              onClick={() => toggle(tool.slug)}
              aria-label={fav ? 'Unfavorite' : 'Favorite'}
              className="text-muted hover:text-accent transition-colors text-base"
            >
              {fav ? '★' : '☆'}
            </button>
          </h1>
          <p className="text-sm text-muted mt-1">{tool.description}</p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="card p-4 sm:p-5">{children}</div>
    </div>
  );
}
