import { useSeo } from '../lib/seo';

export function Terms() {
  useSeo({
    title: 'Terms of Service',
    description:
      'The terms under which debug.online provides its free developer toolkit. Provided as-is, no warranty, fair use only.',
    path: '/terms',
  });

  return (
    <article className="prose prose-invert max-w-3xl text-sm leading-relaxed space-y-5
                        [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight
                        [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-1
                        [&_p]:text-muted [&_li]:text-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
      <h1>Terms of Service</h1>
      <p className="text-2xs text-subtle font-mono">Last updated: 2026-04-26</p>

      <h2>Acceptance</h2>
      <p>
        By using debug.online ("the service") you agree to these terms. If you
        don't agree, please don't use the service.
      </p>

      <h2>Service description</h2>
      <p>
        debug.online provides a collection of free, browser-based developer
        and IT utilities. The service is offered "as is" and "as available"
        with no warranty of any kind, express or implied.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to use the service to:</p>
      <ul>
        <li>Probe, scan or attempt to overwhelm our infrastructure.</li>
        <li>Use the network tools (DNS, SSL) for hosts you do not own or have permission to test.</li>
        <li>Submit content that is illegal, infringing, or violates a third party's rights.</li>
        <li>Bypass rate limits or other technical safeguards.</li>
      </ul>

      <h2>Rate limits and availability</h2>
      <p>
        We may rate-limit, throttle, or temporarily disable features to keep
        the service healthy. We don't guarantee any uptime SLA on a free tier.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The site code, design and content are owned by the operators of
        debug.online. You retain full ownership of any content you paste
        into the tools — we claim no rights over your inputs or outputs.
      </p>

      <h2>Third-party services</h2>
      <p>
        Some features depend on third parties (Anthropic, Google AdSense,
        Vercel KV, public DNS resolvers). Their terms apply to their portions
        of the service.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, debug.online and its
        operators are not liable for any indirect, incidental, special or
        consequential damages arising from use of the service. Don't make
        production decisions based solely on what a free web tool tells you —
        verify with your own infrastructure.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms; the updated date will appear at the top.
        Continued use after a change means you accept the new terms.
      </p>
    </article>
  );
}
