import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-4 right-4 z-30 inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-muted shadow-glow hover:text-accent hover:border-accent transition-colors print:hidden"
    >
      <ArrowUp className="w-4 h-4" aria-hidden />
    </button>
  );
}
