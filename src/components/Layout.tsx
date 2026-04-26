import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';

export function Layout({
  children,
  onOpenPalette,
}: {
  children: ReactNode;
  onOpenPalette: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenPalette={onOpenPalette} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-2xs text-subtle font-mono">
          <span>
            © {new Date().getFullYear()} debug.online — tools that explain themselves.
          </span>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link to="/about" className="hover:text-text">About</Link>
            <span aria-hidden>·</span>
            <Link to="/privacy" className="hover:text-text">Privacy</Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-text">Terms</Link>
            <span aria-hidden>·</span>
            <Link to="/contact" className="hover:text-text">Contact</Link>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
