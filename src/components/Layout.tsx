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
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header onOpenPalette={onOpenPalette} />
      <main
        id="main"
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
      >
        {children}
      </main>
      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-subtle">
          <span className="font-mono">
            © {new Date().getFullYear()} debug.online
          </span>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/about" className="hover:text-text">
              About
            </Link>
            <Link to="/privacy" className="hover:text-text">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-text">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-text">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
