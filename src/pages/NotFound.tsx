import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export function NotFound() {
  useSeo({
    title: 'Page not found',
    description: 'No tool here. Browse the full toolkit on the home page.',
    path: '/404',
  });

  return (
    <div className="card p-10 text-center space-y-4">
      <p className="font-mono text-2xs text-subtle uppercase tracking-wide">404</p>
      <h1 className="text-xl font-semibold">No tool here.</h1>
      <p className="text-muted text-sm">
        That URL doesn't match anything we know about.
      </p>
      <Link to="/" className="btn-accent inline-flex">
        Browse all tools
      </Link>
    </div>
  );
}
