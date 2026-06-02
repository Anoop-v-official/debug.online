import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { tools } from '../lib/tools';
import { posts } from '../blog';

export function About() {
  useSeo({
    title: 'About debugdaily.online — a free developer toolbox',
    description:
      'debugdaily.online is a free, browser-first toolkit of more than 70 developer and IT utilities. About the project, how it is built, and how it stays free.',
    path: '/about',
  });

  return (
    <article className="max-w-3xl text-sm leading-relaxed space-y-6">
      <header className="space-y-3 border-b border-border pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          About debugdaily
        </h1>
        <p className="text-muted text-base">
          A free, browser-first toolbox of {tools.length} developer utilities —
          built because the existing options were either slow, ad-heavy,
          login-gated, or all three at once.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">What this site is</h2>
        <p className="text-muted">
          debugdaily.online is a free online toolkit for the work most
          developers, DevOps engineers, sysadmins and security folks do every
          day: format and validate JSON, decode a JWT, eyeball a regex, hash a
          password, convert a Unix timestamp, look up a DNS record, generate a
          QR code, build a cron expression. Each tool runs in your browser
          wherever physically possible, so the data you paste in does not
          leave your machine and there is no login wall between you and the
          result.
        </p>
        <p className="text-muted">
          We currently host {tools.length} tools and {posts.length} long-form
          articles, with new tools added roughly every week and new posts
          whenever something worth explaining comes up. The full list lives on
          the <Link to="/" className="text-accent hover:underline">home page</Link>{' '}
          and on the <Link to="/blog" className="text-accent hover:underline">blog</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Design principles</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted marker:text-subtle">
          <li>
            <strong className="text-text">Browser-first by default.</strong>{' '}
            Encoders, formatters, hashers and decoders run entirely in your tab
            using native browser APIs (TextEncoder, crypto.subtle, RegExp,
            JSON.parse) or small WebAssembly modules. Your input is never
            uploaded for these tools. Network tools — DNS, WHOIS, ping, SSL —
            necessarily make a request from a server, but they transmit only
            what is required (a hostname, an IP) and do not log payloads.
          </li>
          <li>
            <strong className="text-text">Keyboard-driven.</strong> ⌘K opens a
            fuzzy command palette over every tool on the site. The home page
            search bar supports arrow-key navigation and Enter-to-open. Most
            workflows take three keystrokes total.
          </li>
          <li>
            <strong className="text-text">Smart paste.</strong> Drop a JWT into
            the home page search and we will route you straight to the JWT
            decoder with the token pre-filled. Same for JSON, colors, URLs,
            IPs, domains, UUIDs and Unix timestamps. The detection happens in
            your browser using a few lightweight regexes — no upload, no LLM
            call.
          </li>
          <li>
            <strong className="text-text">Shareable state.</strong> Most tools
            have a Share button that creates a short URL encapsulating the
            current input. Open the link on any device and the tool restores
            the state. Useful for handing off a debugging breadcrumb to a
            teammate without screenshots.
          </li>
          <li>
            <strong className="text-text">Fast everywhere.</strong> Every tool
            is its own lazy chunk, the whole site is prerendered to static
            HTML, and the JS bundle for the shell is a few dozen kilobytes
            gzipped. First Contentful Paint is well under a second on a warm
            connection.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">How it is built</h2>
        <p className="text-muted">
          The frontend is React 18 with Vite and Tailwind CSS. State is local
          to each tool except for two zustand stores — favorites and the
          command palette. Routing is react-router. Network tools run as
          Vercel serverless functions written in TypeScript. The site is
          deployed to the Vercel edge network and the static HTML is
          pre-rendered at build time from the React tree, so every tool URL
          ships with full server-rendered content for search engines and
          first-paint speed.
        </p>
        <p className="text-muted">
          The whole frontend is a few hundred kilobytes total. Heavy
          tool-specific libraries — sql-formatter, bcryptjs, js-yaml, qrcode —
          are split into separate dynamic chunks so they only download when you
          open the tool that needs them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Why a blog?</h2>
        <p className="text-muted">
          A surprising amount of "developer utility" content on the web is
          shallow — a tool, a screenshot, a single paragraph of SEO filler.
          The blog exists for the opposite reason: when a topic comes up over
          and over in the tools (bcrypt cost factors, JWT verification, cron
          dialect differences, DNS records, SPF/DKIM/DMARC), it deserves a
          proper explainer. Posts are written from real production debugging
          experience, not from copying somebody else&apos;s how-to.
        </p>
        <p className="text-muted">
          You can find every post on the{' '}
          <Link to="/blog" className="text-accent hover:underline">blog page</Link>,
          and each tool that has a relevant post links to it from its "Further
          reading" section.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">
          How the site stays free
        </h2>
        <p className="text-muted">
          debugdaily costs real money to run: DNS queries, WHOIS calls, edge
          bandwidth, the occasional AI model API call. Tool pages display
          unobtrusive ads to cover those costs. The home page, the command
          palette, the blog and the policy pages stay ad-free so the
          high-traffic flows are not cluttered.
        </p>
        <p className="text-muted">
          We do not sell user data because we do not have any to sell —
          browser-first tools never see your input, and network tools log only
          what is needed for rate limiting and anti-abuse (a hashed IP, a
          timestamp, a status code).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">What is coming next</h2>
        <p className="text-muted">
          The current roadmap has a few directions in parallel. More tools
          where existing options are weak — protocol-specific testers (gRPC,
          GraphQL), more cryptography helpers, more format converters. Deeper
          long-form content tied to the most-used tools. A Tauri desktop build
          so the same toolbox works offline as a native app. And a small set
          of opt-in cloud features (shared workspaces, saved snippets) for
          teams who want the convenience.
        </p>
        <p className="text-muted">
          Feature requests, bug reports and "this would be useful" suggestions
          go to the{' '}
          <Link to="/contact" className="text-accent hover:underline">
            contact page
          </Link>
          . The most-requested ideas tend to ship within a week or two.
        </p>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="font-display text-xl font-semibold">Quick links</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          <li>
            <Link to="/" className="text-accent hover:underline">
              All {tools.length} tools
            </Link>
          </li>
          <li>
            <Link to="/blog" className="text-accent hover:underline">
              Blog ({posts.length} posts)
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="text-accent hover:underline">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link to="/terms" className="text-accent hover:underline">
              Terms of use
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-accent hover:underline">
              Contact / feedback
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
