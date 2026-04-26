import { Link } from 'react-router-dom';
import { type Tool, categoryLabels } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';

export function ToolGrid({ items }: { items: Tool[] }) {
  const slugs = useFavoritesStore((s) => s.slugs);
  const toggle = useFavoritesStore((s) => s.toggle);

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-muted text-sm">
        No tools matched.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((tool) => {
        const fav = slugs.includes(tool.slug);
        return (
          <li key={tool.slug} className="relative group">
            <Link
              to={`/tools/${tool.slug}`}
              className="block card p-4 transition-colors hover:border-border-strong hover:bg-surface-2 h-full"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-text">{tool.name}</h3>
                <span className="chip">{categoryLabels[tool.category]}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{tool.description}</p>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle(tool.slug);
              }}
              aria-label={fav ? 'Unfavorite' : 'Favorite'}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100
                         text-muted hover:text-accent transition-opacity"
            >
              {fav ? '★' : '☆'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
