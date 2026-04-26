import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { CommandPalette } from './components/CommandPalette';
import { CookieBanner } from './components/CookieBanner';
import { useHistoryStore } from './store/history';
import { tools } from './lib/tools';

const ToolPage = lazy(() =>
  import('./pages/ToolPage').then((m) => ({ default: m.ToolPage })),
);

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const recordVisit = useHistoryStore((s) => s.record);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (inField) return;

      if (e.key === '?') {
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Layout onOpenPalette={() => setPaletteOpen(true)}>
      <Suspense
        fallback={
          <div className="p-8 text-muted text-sm font-mono animate-pulse-soft">
            loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home onOpenPalette={() => setPaletteOpen(true)} />} />
          <Route path="/tools/:slug" element={<ToolPage onVisit={recordVisit} />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        items={tools}
        onSelect={(slug) => {
          setPaletteOpen(false);
          navigate(`/tools/${slug}`);
        }}
      />
      <CookieBanner />
    </Layout>
  );
}
