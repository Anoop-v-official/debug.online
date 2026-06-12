import { Link } from 'react-router-dom';
import { type Tool } from '../lib/tools';
import { relatedPosts } from '../blog';

export function ToolContentBlock({ tool }: { tool: Tool }) {
  const { content, name } = tool;
  const posts = relatedPosts([tool.slug, ...tool.keywords]);

  // Build a section list for the table of contents. Only sections that have
  // content show up — keeps the ToC honest for tools without examples or FAQs.
  const sections: Array<{ id: string; label: string }> = [
    { id: 'about', label: `About ${name}` },
  ];
  if (content.howItWorks && content.howItWorks.length > 0)
    sections.push({ id: 'how-it-works', label: 'How it works' });
  sections.push({ id: 'when-to-use', label: 'When to use it' });
  if (content.examples && content.examples.length > 0)
    sections.push({ id: 'examples', label: 'Examples' });
  if (content.gotchas && content.gotchas.length > 0)
    sections.push({ id: 'gotchas', label: 'Things to watch for' });
  if (content.faq && content.faq.length > 0)
    sections.push({ id: 'faq', label: 'FAQ' });
  if (posts.length > 0)
    sections.push({ id: 'further-reading', label: 'Further reading' });

  const showToc = sections.length >= 4;

  return (
    <section className="mt-6 space-y-5 text-sm leading-relaxed">
      {showToc ? (
        <nav
          aria-label="On this page"
          className="rounded-md border border-border bg-surface px-4 py-3 print:hidden"
        >
          <div className="text-2xs uppercase tracking-widest font-mono text-subtle mb-2">
            On this page
          </div>
          <ol className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted hover:text-accent transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div id="about" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold text-text">About {name}</h2>
        <p className="text-muted">{content.about}</p>
      </div>

      {content.howItWorks && content.howItWorks.length > 0 ? (
        <div id="how-it-works" className="space-y-2 scroll-mt-20">
          <h2 className="text-base font-semibold text-text">How it works</h2>
          {content.howItWorks.map((p, i) => (
            <p key={i} className="text-muted">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      <div id="when-to-use" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold text-text">When to use it</h2>
        <ul className="space-y-1 list-disc pl-5 text-muted marker:text-subtle">
          {content.useCases.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>

      {content.examples && content.examples.length > 0 ? (
        <div id="examples" className="space-y-3 scroll-mt-20">
          <h2 className="text-base font-semibold text-text">Examples</h2>
          {content.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-surface p-3 space-y-2"
            >
              <div className="text-text font-medium">{ex.title}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
                    Input
                  </div>
                  <pre className="text-xs font-mono text-text bg-bg/60 border border-border rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                    {ex.input}
                  </pre>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
                    Output
                  </div>
                  <pre className="text-xs font-mono text-text bg-bg/60 border border-border rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                    {ex.output}
                  </pre>
                </div>
              </div>
              {ex.note ? (
                <p className="text-xs text-muted">{ex.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {content.gotchas && content.gotchas.length > 0 ? (
        <div id="gotchas" className="space-y-2 scroll-mt-20">
          <h2 className="text-base font-semibold text-text">Things to watch for</h2>
          <ul className="space-y-1 list-disc pl-5 text-muted marker:text-subtle">
            {content.gotchas.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {content.faq && content.faq.length > 0 ? (
        <div id="faq" className="space-y-2 scroll-mt-20">
          <h2 className="text-base font-semibold text-text">FAQ</h2>
          <dl className="space-y-3">
            {content.faq.map((f, i) => (
              <div key={i} className="space-y-1">
                <dt className="text-text font-medium">{f.q}</dt>
                <dd className="text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {posts.length > 0 ? (
        <div id="further-reading" className="space-y-2 pt-2 scroll-mt-20">
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
