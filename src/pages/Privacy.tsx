import { useSeo } from '../lib/seo';

export function Privacy() {
  useSeo({
    title: 'Privacy Policy',
    description:
      'How debug.online handles your data: what runs locally, what is sent to our server, and what third parties may set cookies.',
    path: '/privacy',
  });

  return (
    <article className="prose prose-invert max-w-3xl text-sm leading-relaxed space-y-5
                        [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight
                        [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-1
                        [&_p]:text-muted [&_li]:text-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
      <h1>Privacy Policy</h1>
      <p className="text-2xs text-subtle font-mono">Last updated: 2026-04-26</p>

      <h2>What we collect</h2>
      <p>
        debug.online is a free toolkit. The vast majority of tools run entirely
        in your browser — your input never reaches our server. The exceptions
        are documented below.
      </p>

      <h2>Local storage on your device</h2>
      <p>We keep a small amount of state in your browser's local storage:</p>
      <ul>
        <li>Your favorite tools, so the home page can highlight them.</li>
        <li>Recently used tools, to surface them again next visit.</li>
        <li>Whether you've dismissed our cookie banner.</li>
      </ul>
      <p>This data never leaves your device. Clearing site data removes it.</p>

      <h2>Server-side tools</h2>
      <p>
        A few tools require a server hop — DNS Lookup, SSL Check, AI Smart
        Context insights, and share-link snapshots. For those:
      </p>
      <ul>
        <li>
          <strong>DNS / SSL:</strong> the hostname you submit is sent to our
          serverless function and to public resolvers (Cloudflare 1.1.1.1,
          Google 8.8.8.8). We do not log it.
        </li>
        <li>
          <strong>Smart Context:</strong> if enabled, your tool input/output
          is sent to Anthropic's Claude API to generate a plain-English
          explanation. See Anthropic's privacy policy for their handling.
        </li>
        <li>
          <strong>Share links:</strong> when you click "Share", the current
          tool state is stored against a random ID so the recipient can load
          it. Stored snapshots are kept for up to 30 days.
        </li>
      </ul>

      <h2>Cookies and advertising</h2>
      <p>
        On individual tool pages we may display ads served by Google AdSense.
        Google and its partners may set cookies to serve and measure ads. You
        can review and adjust your ad preferences at{' '}
        <a className="text-accent hover:underline" href="https://adssettings.google.com">
          Google Ad Settings
        </a>
        . The home page and policy pages do not display ads.
      </p>

      <h2>Analytics</h2>
      <p>
        We do not run any first-party analytics or tracking pixels. Server
        logs may retain IP addresses for a short window for abuse protection.
      </p>

      <h2>Children</h2>
      <p>
        debug.online is not directed at children under 13. We don't knowingly
        collect data from anyone in that age range.
      </p>

      <h2>Changes</h2>
      <p>
        Updates to this policy will appear here with a new "Last updated"
        date. Material changes will also be flagged on the home page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? See our <a className="text-accent hover:underline" href="/contact">contact page</a>.
      </p>
    </article>
  );
}
