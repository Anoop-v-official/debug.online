import { Link } from 'react-router-dom';
import { type Tool } from '../lib/tools';
import { relatedPosts } from '../blog';

export function ToolContentBlock({ tool }: { tool: Tool }) {
  const { content, name } = tool;
  const posts = relatedPosts([tool.slug, ...tool.keywords]);

  return (
    <section className="mt-6 space-y-5 text-sm leading-relaxed">
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-text">About {name}</h2>
        <p className="text-muted">{content.about}</p>
      </div>
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-text">When to use it</h2>
        <ul className="space-y-1 list-disc pl-5 text-muted marker:text-subtle">
          {content.useCases.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>
      {content.gotchas && content.gotchas.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text">Things to watch for</h2>
          <ul className="space-y-1 list-disc pl-5 text-muted marker:text-subtle">
            {content.gotchas.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {posts.length > 0 ? (
        <div className="space-y-2 pt-2">
          <h2 className="text-base font-semibold text-text">Further reading</h2>
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/blog/${p.slug}`}
                  className="group flex items-start gap-2 rounded-md border border-border bg-surface p-3 hover:border-border-strong hover:bg-surface-2 transition-colors"
                >
                  <span aria-hidden className="text-accent shrink-0 mt-0.5">
                    ↗
                  </span>
                  <div className="min-w-0">
                    <div className="text-text group-hover:text-accent transition-colors">
                      {p.title}
                    </div>
                    <div className="text-2xs text-subtle font-mono mt-0.5">
                      {p.readingTimeMin} min read · {p.tags.slice(0, 3).join(' · ')}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
