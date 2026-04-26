import { Link } from 'react-router-dom';
import { type Tool, type Category, categoryLabels } from '../lib/tools';
import { useFavoritesStore } from '../store/favorites';

const stripeClass: Record<Category, string> = {
  encode: 'stripe-encode',
  format: 'stripe-format',
  inspect: 'stripe-inspect',
  generate: 'stripe-generate',
  network: 'stripe-network',
  convert: 'stripe-convert',
};

export function ToolGrid({ items }: { items: Tool[] }) {
  const slugs = useFavoritesStore((s) => s.slugs);
  const toggle = useFavoritesStore((s) => s.toggle);

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-muted text-sm">No tools matched.</div>
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
              className={`block card p-4 pl-5 transition-all hover:border-border-strong hover:bg-surface-2 hover:-translate-y-0.5 h-full ${stripeClass[tool.category]}`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h3 className="font-medium text-text">{tool.name}</h3>
                <span className="chip shrink-0">{categoryLabels[tool.category]}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed pr-6">
                {tool.description}
              </p>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle(tool.slug);
              }}
              aria-label={fav ? 'Unfavorite' : 'Favorite'}
              aria-pressed={fav}
              className={`absolute bottom-3 right-3 p-1 transition-colors ${
                fav ? 'text-accent' : 'text-subtle hover:text-accent'
              }`}
            >
              {fav ? '★' : '☆'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
