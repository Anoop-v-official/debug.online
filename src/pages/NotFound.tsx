import { Link } from 'react-router-dom';

export function NotFound() {
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
