import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

interface Entry {
  date: string;
  tag: 'feature' | 'tool' | 'content' | 'fix';
  title: string;
  body: string;
  links?: Array<{ label: string; to: string }>;
}

const TAG_STYLE: Record<Entry['tag'], string> = {
  feature: 'border-accent/40 bg-accent/10 text-accent',
  tool: 'border-role-backend/40 bg-role-backend/10 text-role-backend',
  content: 'border-role-frontend/40 bg-role-frontend/10 text-role-frontend',
  fix: 'border-role-devops/40 bg-role-devops/10 text-role-devops',
};

const TAG_LABEL: Record<Entry['tag'], string> = {
  feature: 'feature',
  tool: 'new tool',
  content: 'content',
  fix: 'fix',
};

const ENTRIES: Entry[] = [
  {
    date: '2026-06-13',
    tag: 'feature',
    title: 'Request a tool',
    body:
      'When a search returns no matches, you can now submit a tool request directly from the empty state. Popular requests get built first.',
    links: [{ label: 'Try it', to: '/' }],
  },
  {
    date: '2026-06-13',
    tag: 'feature',
    title: 'Real cookie consent',
    body:
      'AdSense and tool-open analytics now wait for explicit consent before loading. Decline and we will not set third-party cookies or record analytics.',
  },
  {
    date: '2026-06-13',
    tag: 'fix',
    title: 'Back-to-top button + table of contents on long tool pages',
    body:
      'Tool pages with substantive content now have a jump menu and a floating back-to-top button after the first scroll.',
  },
  {
    date: '2026-06-12',
    tag: 'feature',
    title: 'Tool of the Day on the homepage',
    body:
      'The most-opened tool is highlighted above the grid. Updates live as session counts change.',
  },
  {
    date: '2026-06-12',
    tag: 'tool',
    title: '10 more tool pages expanded',
    body:
      'JSON → TS, JSON → CSV, JSON → YAML, XML formatter, diff viewer, uptime checker, API tester, cURL builder, date diff, case converter — each now has a 700+ word explainer with examples, gotchas and FAQ.',
  },
  {
    date: '2026-06-12',
    tag: 'content',
    title: 'New blog posts',
    body:
      'Three new long-form posts: chmod permissions explained, HMAC for webhook security, CIDR for cloud engineers.',
    links: [{ label: 'Read', to: '/blog' }],
  },
  {
    date: '2026-06-10',
    tag: 'feature',
    title: 'Embeddable widgets',
    body:
      'Drop any tool into your blog or docs with one script tag. Auto-resize, sandboxed iframe, attribution link back. Open the Embed button on any tool page.',
    links: [{ label: 'Docs', to: '/embed' }],
  },
  {
    date: '2026-06-08',
    tag: 'feature',
    title: 'PWA install',
    body:
      'On supported browsers, debugdaily can be installed as a Progressive Web App for one-tap launch from home screen / dock.',
  },
  {
    date: '2026-06-08',
    tag: 'feature',
    title: 'Stats page',
    body:
      'See the ranking of every tool by real session opens, plus live-user count and total visits.',
    links: [{ label: 'Open stats', to: '/stats' }],
  },
  {
    date: '2026-06-05',
    tag: 'tool',
    title: 'New tools: JWT generator, Mermaid renderer, X.509 decoder',
    body:
      'Three flagship tools. JWT generator pairs with the existing decoder. Mermaid renders flowchart, sequence, ER, gantt and pie. X.509 decoder parses any PEM certificate.',
  },
  {
    date: '2026-06-01',
    tag: 'content',
    title: '20 tool pages expanded with full content blocks',
    body:
      'JSON formatter, JWT decoder, Base64, URL encoder, regex tester, UUID, hash, bcrypt, cron, timestamp, password generator, HTTP status, YAML validator, SSL check, DNS lookup, IP lookup, WHOIS, QR code, color converter, random number — each now has substantive content for first-time visitors and search engines.',
  },
];

export function Changelog() {
  useSeo({
    title: "What's New — debugdaily Changelog",
    description:
      'Recent updates to debugdaily.online — new tools, features, fixes and editorial content. Updated continuously.',
    path: '/changelog',
  });

  return (
    <article className="max-w-3xl space-y-6">
      <header className="space-y-2 border-b border-border pb-5">
        <div className="text-2xs uppercase tracking-widest font-mono text-subtle">
          Continuously updated
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          What&apos;s new
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          A timeline of every change worth knowing about — new tools, new
          features, new long-form content, important fixes. Most recent first.
        </p>
      </header>

      <ol className="space-y-5">
        {ENTRIES.map((e, i) => (
          <li
            key={i}
            className="rounded-md border border-border bg-surface p-4 space-y-2 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center gap-2 flex-wrap text-2xs font-mono">
              <span className="text-subtle">{e.date}</span>
              <span
                className={`chip border ${TAG_STYLE[e.tag]}`}
              >
                {TAG_LABEL[e.tag]}
              </span>
            </div>
            <h2 className="font-display text-lg font-semibold text-text">
              {e.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{e.body}</p>
            {e.links && e.links.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                {e.links.map((l, j) => (
                  <Link
                    key={j}
                    to={l.to}
                    className="text-accent hover:underline"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <footer className="text-2xs text-subtle font-mono pt-4 border-t border-border">
        Missing a change? Use the Request a tool link in the footer or open the
        contact page.
      </footer>
    </article>
  );
}
