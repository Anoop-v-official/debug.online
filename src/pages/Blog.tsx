import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { posts } from '../blog';

export function Blog() {
  useSeo({
    title: 'Blog — debugdaily',
    description:
      'Practical engineering writing on DNS, JWT, password hashing, regex, and the rest of the daily debugging surface.',
    path: '/blog',
  });

  return (
    <article className="max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-2xs font-mono uppercase tracking-wider text-subtle">Blog</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Engineering notes from <span className="text-accent">debugdaily</span>.
        </h1>
        <p className="text-muted">
          Practical, no-fluff writing on the kind of bugs and decisions you actually hit. New posts
          appear here when we have something worth saying — not on a schedule.
        </p>
      </header>

      <ul className="divide-y divide-border">
        {posts.map((p) => (
          <li key={p.slug} className="py-5 first:pt-0">
            <Link
              to={`/blog/${p.slug}`}
              className="block group space-y-2"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-text group-hover:text-accent transition-colors">
                  {p.title}
                </h2>
                <span className="text-2xs font-mono text-subtle shrink-0">
                  {formatDate(p.publishedAt)} · {p.readingTimeMin} min read
                </span>
              </div>
              <p className="text-muted text-sm leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
