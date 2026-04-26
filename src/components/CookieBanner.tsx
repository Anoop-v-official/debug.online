import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'debug.online:cookie-consent';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* private mode, etc. */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* no-op */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-3 sm:bottom-3 sm:max-w-sm z-40
                    card p-3 shadow-glow text-xs text-muted">
      <p className="leading-relaxed">
        We use local storage for your preferences and may show ads on tool pages
        that set their own cookies. See our{' '}
        <Link to="/privacy" className="text-accent hover:underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="flex gap-2 mt-2 justify-end">
        <button type="button" className="btn-ghost text-2xs" onClick={accept}>
          Dismiss
        </button>
        <button type="button" className="btn-accent text-2xs" onClick={accept}>
          Got it
        </button>
      </div>
    </div>
  );
}
