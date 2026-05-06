import { Link } from 'react-router-dom';
import { tools, type Tool, categoryLabels } from '../lib/tools';

const MAX = 6;

function score(current: Tool, candidate: Tool): number {
  if (candidate.slug === current.slug) return -1;
  let s = 0;
  if (candidate.category === current.category) s += 10;
  const curKw = new Set(current.keywords);
  for (const kw of candidate.keywords) if (curKw.has(kw)) s += 3;
  return s;
}

function pickRelated(current: Tool): Tool[] {
  return tools
    .map((t) => ({ tool: t, score: score(current, t) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX)
    .map((x) => x.tool);
}

export function RelatedTools({ tool }: { tool: Tool }) {
  const related = pickRelated(tool);
  if (related.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t border-border">
      <h2 className="text-2xs uppercase tracking-wider font-mono text-subtle mb-3">
        Related tools
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {related.map((t) => (
          <li key={t.slug}>
            <Link
              to={`/tools/${t.slug}`}
              className="group flex items-start justify-between gap-2 rounded-md border border-border bg-surface p-3 hover:border-border-strong hover:bg-surface-2 transition-colors h-full"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm text-text group-hover:text-accent transition-colors">
                  {t.name}
                </div>
                <div className="text-2xs text-subtle font-mono mt-0.5">
                  {categoryLabels[t.category]}
                </div>
                <div className="text-xs text-muted mt-1.5 line-clamp-2">
                  {t.description}
                </div>
              </div>
              <span
                aria-hidden
                className="text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
