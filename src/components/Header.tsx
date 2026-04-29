import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MoonStar, Search, X } from 'lucide-react';

interface HeaderProps {
  onOpenPalette: () => void;
}

const NAV: Array<{ label: string; href: string }> = [
  { label: 'All Tools', href: '/' },
  { label: 'By Role', href: '/#backend' },
  { label: 'Most Searched', href: '/#trending' },
  { label: 'New Tools', href: '/#new' },
];

export function Header({ onOpenPalette }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 6);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-6">
        <Link
          to="/"
          aria-label="debugdaily home"
          className="font-display font-semibold tracking-tight text-lg shrink-0 select-none"
        >
          <span className="text-text">debug</span>
          <span className="text-accent">{'<daily>'}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Primary">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-md text-sm text-muted hover:text-text hover:bg-surface transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Search tools (Cmd+K)"
            className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface text-muted text-sm hover:border-border-strong hover:text-text transition-colors min-w-[200px]"
          >
            <Search className="w-4 h-4" aria-hidden />
            <span className="text-subtle">Search tools…</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenPalette}
            aria-label="Search"
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface text-muted hover:text-text"
          >
            <Search className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            aria-label="Theme toggle (light mode coming soon)"
            title="Light mode coming soon"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface text-muted hover:text-text"
          >
            <MoonStar className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface text-muted hover:text-text"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Animated gradient line on scroll */}
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 right-0 -bottom-px h-px overflow-hidden transition-opacity ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="block h-full w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent animate-glow-line" />
      </span>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="md:hidden border-t border-border bg-bg">
          <nav className="px-4 py-3 flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="px-3 py-2 rounded-md text-sm text-muted hover:text-text hover:bg-surface"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
