import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { tools } from '../lib/tools';

export function About() {
  useSeo({
    title: 'About debug.online',
    description:
      'debug.online is a free, browser-first toolkit of 23 developer and IT utilities with optional AI-powered Smart Context explanations.',
    path: '/about',
  });

  return (
    <article className="max-w-3xl text-sm leading-relaxed space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">About debug.online</h1>

      <p className="text-muted">
        debug.online is a free toolkit for developers, sysadmins, and anyone
        who finds themselves regularly decoding a JWT, formatting JSON,
        eyeballing a regex, or chasing down a DNS record at 2am. We bundle
        the {tools.length} tools you reach for most into one fast, keyboard-driven page.
      </p>

      <h2 className="text-base font-semibold mt-6">What makes it different</h2>
      <ul className="list-disc pl-5 space-y-1 text-muted marker:text-subtle">
        <li>
          <strong>Smart Context.</strong> Most tools include an optional
          AI-powered explanation of the result — what it means, what looks
          unusual, and what to try next.
        </li>
        <li>
          <strong>Browser-first.</strong> Encoders, formatters and decoders
          run entirely in your browser. Your input doesn't get uploaded.
        </li>
        <li>
          <strong>Keyboard-driven.</strong> ⌘K opens a fuzzy palette over
          every tool. Most workflows take three keystrokes.
        </li>
        <li>
          <strong>Shareable state.</strong> Hit Share on any tool to get a
          short URL that recreates the input on another machine.
        </li>
      </ul>

      <h2 className="text-base font-semibold mt-6">How it's built</h2>
      <p className="text-muted">
        React 18 + Vite + Tailwind, deployed on Vercel. Network and AI
        features run as Vercel serverless functions. The whole frontend is
        a few hundred kilobytes total — every tool is a separate lazy chunk.
      </p>

      <h2 className="text-base font-semibold mt-6">Free, with ads on tool pages</h2>
      <p className="text-muted">
        debug.online costs money to run (DNS lookups, AI calls, hosting).
        Tool pages may display non-intrusive ads to cover that. The home
        page, command palette, and policy pages stay ad-free.
      </p>

      <p className="text-muted">
        Browse the full list on the <Link to="/" className="text-accent hover:underline">home page</Link>{' '}
        or get in touch via the <Link to="/contact" className="text-accent hover:underline">contact page</Link>.
      </p>
    </article>
  );
}
