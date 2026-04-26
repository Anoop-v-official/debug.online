import { Link } from 'react-router-dom';

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-accent font-mono text-lg leading-none">{'>_'}</span>
          <span className="font-semibold tracking-tight">
            debug<span className="text-accent">.online</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-border bg-surface
                     text-muted text-sm hover:border-border-strong hover:text-text transition-colors
                     w-full max-w-xs"
        >
          <span className="text-subtle">Search tools…</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </span>
        </button>
      </div>
    </header>
  );
}
