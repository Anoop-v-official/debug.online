import { Link } from 'react-router-dom';

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 group shrink-0"
          aria-label="debug.online home"
        >
          <span className="text-accent font-mono text-lg leading-none transition-transform group-hover:translate-x-0.5">
            {'>_'}
          </span>
          <span className="font-semibold tracking-tight hidden sm:inline">
            debug<span className="text-accent">.online</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onOpenPalette}
          className="ml-auto flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface
                     text-muted text-sm hover:border-border-strong hover:text-text transition-colors"
          aria-label="Search tools"
        >
          <SearchIcon />
          <span className="hidden sm:inline text-subtle">Search tools…</span>
          <span className="hidden sm:flex items-center gap-1 ml-3">
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </span>
        </button>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3.5 3.5" />
    </svg>
  );
}
