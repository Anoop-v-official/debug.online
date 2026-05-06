import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { postBySlug, posts } from '../blog';
import { NotFound } from './NotFound';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? postBySlug[slug] : undefined;

  useSeo({
    title: post ? `${post.title} — debugdaily blog` : 'Blog post — debugdaily',
    description: post?.description ?? '',
    path: `/blog/${slug ?? ''}`,
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.publishedAt,
          author: { '@type': 'Organization', name: 'debugdaily' },
          description: post.description,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://debugdaily.online/blog/${post.slug}`,
          },
          keywords: post.tags.join(', '),
        }
      : undefined,
  });

  if (!post) return <NotFound />;
  const Component = post.Component;

  const idx = posts.findIndex((p) => p.slug === post.slug);
  const next = posts[idx + 1];
  const prev = posts[idx - 1];

  return (
    <article className="max-w-3xl space-y-6">
      <div className="text-2xs font-mono text-subtle">
        <Link to="/blog" className="hover:text-text transition-colors">
          ← Blog
        </Link>
      </div>

      <header className="space-y-3 border-b border-border pb-6">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-2xs font-mono text-subtle">
            {formatDate(post.publishedAt)} · {post.readingTimeMin} min read
          </span>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="text-muted text-base leading-relaxed">{post.description}</p>
      </header>

      <div
        className="prose prose-invert max-w-none
                   text-text text-base leading-relaxed
                   [&_p]:my-4
                   [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3
                   [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-7 [&_h3]:mb-2
                   [&_strong]:text-text [&_strong]:font-semibold
                   [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-accent-dim
                   [&_ul]:my-4 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5
                   [&_ol]:my-4 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5
                   [&_li]:text-muted
                   [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-text [&_code]:border [&_code]:border-border
                   [&_pre]:bg-surface-2 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:my-5 [&_pre]:border [&_pre]:border-border [&_pre]:overflow-auto
                   [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:border-0 [&_pre>code]:text-xs"
      >
        <Suspense fallback={<p className="text-subtle">Loading…</p>}>
          <Component />
        </Suspense>
      </div>

      <nav className="border-t border-border pt-6 flex items-center justify-between gap-3 text-sm">
        {prev ? (
          <Link to={`/blog/${prev.slug}`} className="group flex flex-col">
            <span className="text-2xs font-mono uppercase tracking-wider text-subtle">← Newer</span>
            <span className="text-text group-hover:text-accent transition-colors">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/blog/${next.slug}`} className="group flex flex-col text-right ml-auto">
            <span className="text-2xs font-mono uppercase tracking-wider text-subtle">Older →</span>
            <span className="text-text group-hover:text-accent transition-colors">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
