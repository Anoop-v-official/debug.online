import { useSeo } from '../lib/seo';

export function Contact() {
  useSeo({
    title: 'Contact',
    description:
      'Get in touch with the debug.online team — feedback, bug reports, partnership and tool requests.',
    path: '/contact',
  });

  return (
    <article className="max-w-2xl text-sm leading-relaxed space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>

      <p className="text-muted">
        We're a small team. The fastest way to reach us depends on what you need.
      </p>

      <div className="card p-4 space-y-3">
        <Row label="General / feedback" value="hello@debugdaily.online" />
        <Row label="Bug reports" value="bugs@debugdaily.online" />
        <Row label="Privacy / takedown" value="privacy@debugdaily.online" />
        <Row label="Advertising / partnerships" value="ads@debugdaily.online" />
      </div>

      <p className="text-muted">
        Please include the URL and a copy of any input that produced the
        problem (with secrets redacted). We typically respond within a few
        business days.
      </p>

      <p className="text-2xs text-subtle font-mono">
        debug.online · operated remotely · responses on a best-effort basis.
      </p>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
      <span className="text-2xs uppercase tracking-wide text-subtle font-mono w-44 shrink-0">
        {label}
      </span>
      <a className="text-text font-mono break-all hover:text-accent" href={`mailto:${value}`}>
        {value}
      </a>
    </div>
  );
}
