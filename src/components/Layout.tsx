import { type ReactNode } from 'react';
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-2xs text-subtle font-mono">
          <span>debug.online — tools that explain themselves.</span>
          <span className="flex items-center gap-2">
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
            <span>opens command palette</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
