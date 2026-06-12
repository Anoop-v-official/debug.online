import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { tools } from '../lib/tools';
import { copy } from '../lib/clipboard';
import { Check, Copy } from 'lucide-react';

const SITE = 'https://debugdaily.online';

const POPULAR = [
  'json-format',
  'jwt-decode',
  'base64',
  'regex-tester',
  'uuid-generator',
  'cron-parser',
];

export function Embed() {
  useSeo({
    title: 'Embed Tools — debugdaily',
    description:
      'Drop any debugdaily tool into your blog, docs, or website with one line of HTML. Free forever. Browser-first, no API key required.',
    path: '/embed',
  });

  return (
    <article className="max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-6">
        <div className="text-2xs uppercase tracking-widest font-mono text-subtle">
          For publishers
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Embed any tool, anywhere
        </h1>
        <p className="text-muted text-base leading-relaxed">
          Drop a working JSON formatter, JWT decoder, regex tester or any of
          the {tools.length}+ tools into your blog, docs, README or knowledge
          base with one line of HTML. Free forever. No login, no API key, no
          attribution required beyond the small "Powered by debugdaily" link.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Quickstart</h2>
        <p className="text-sm text-muted">
          Paste this anywhere HTML is allowed. Replace <code>json-format</code>{' '}
          with any tool slug from the catalog below.
        </p>
        <CopySnippet
          label="Script tag (recommended — auto-resizes to fit content)"
          code={`<script
  src="${SITE}/embed.js"
  data-debugdaily-embed
  data-tool="json-format"
  data-height="640"
  async
></script>`}
        />
        <CopySnippet
          label="Plain iframe (works in Notion, Ghost, WordPress, anywhere iframes are allowed)"
          code={`<iframe
  src="${SITE}/embed/json-format"
  width="100%"
  height="640"
  loading="lazy"
  style="border:0;border-radius:8px;max-width:100%"
  title="JSON Formatter · debugdaily"
></iframe>`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Popular embeds</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {POPULAR.map((slug) => {
            const tool = tools.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <Link
                key={slug}
                to={`/tools/${slug}`}
                className="group rounded-md border border-border bg-surface p-3 hover:border-border-strong hover:bg-surface-2 transition-colors"
              >
                <div className="text-sm text-text group-hover:text-accent transition-colors">
                  {tool.name}
                </div>
                <div className="text-2xs text-subtle font-mono mt-1">
                  data-tool="{slug}"
                </div>
              </Link>
            );
          })}
        </div>
        <p className="text-2xs text-subtle font-mono">
          Click "Embed" on any tool page for a custom snippet with live preview.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">How it works</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted marker:text-subtle">
          <li>
            <strong className="text-text">Iframe-based.</strong> The tool runs
            in its own sandboxed iframe. Your page CSS, JS and analytics are
            unaffected.
          </li>
          <li>
            <strong className="text-text">Privacy-preserving.</strong> Whatever
            a user types into the embedded tool stays in their browser.
            Nothing is sent to debugdaily except a tool-open count (no IPs, no
            payloads).
          </li>
          <li>
            <strong className="text-text">Auto-resizing.</strong> The script
            embed listens for resize messages from the iframe and adjusts the
            height to match the tool&apos;s content. The plain iframe option
            uses a fixed height.
          </li>
          <li>
            <strong className="text-text">Lazy-loaded.</strong> The iframe has{' '}
            <code>loading="lazy"</code> by default, so it only loads when
            scrolled into view.
          </li>
          <li>
            <strong className="text-text">Attribution.</strong> Each embed
            shows a small "Powered by debugdaily" link at the bottom. Please
            keep it visible — it&apos;s how the project sustains itself.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">FAQ</h2>
        <dl className="space-y-4 text-sm">
          <Q
            q="Is there a rate limit or quota?"
            a="No. Embed as many tools on as many pages as you want."
          />
          <Q
            q="Can I customize colors or branding?"
            a="The embed uses the site theme so the tools look consistent across publishers. Per-embed theming is on the roadmap; ping us if you want it sooner."
          />
          <Q
            q="Does it work on mobile?"
            a="Yes. Tools are responsive and the iframe resizes to fit any container width."
          />
          <Q
            q="Will the embed break if you redesign?"
            a="The /embed/<slug> URL is a stable contract. Internal tool layouts may evolve, but the embed URL and the postMessage protocol will not change without an obvious upgrade path."
          />
          <Q
            q="Can I host this self-contained instead?"
            a="The project is open-source on GitHub if you want to run your own copy. The hosted embed is the easiest option for most cases."
          />
        </dl>
      </section>
    </article>
  );
}

function CopySnippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    const ok = await copy(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }
  return (
    <div className="space-y-1.5">
      <div className="text-2xs uppercase tracking-wide font-mono text-subtle">
        {label}
      </div>
      <div className="relative">
        <pre className="pane-wrap text-xs font-mono whitespace-pre-wrap break-all">
          {code}
        </pre>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? 'Copied' : 'Copy'}
          className={
            'absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-md border transition-all ' +
            (copied
              ? 'border-accent text-accent bg-surface/90'
              : 'border-border text-subtle bg-surface/90 hover:text-accent hover:border-border-strong')
          }
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Q({ q, a }: { q: string; a: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-text font-medium">{q}</dt>
      <dd className="text-muted">{a}</dd>
    </div>
  );
}
