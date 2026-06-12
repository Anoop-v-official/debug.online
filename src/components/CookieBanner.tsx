import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent } from '../lib/consent';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show the banner only when the user has not made a choice yet.
    if (getConsent() === 'pending') {
      // Tiny delay so the banner does not fight first paint.
      const id = window.setTimeout(() => setShow(true), 400);
      return () => window.clearTimeout(id);
    }
  }, []);

  function accept() {
    setConsent('granted');
    setShow(false);
  }
  function decline() {
    setConsent('denied');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-3 sm:bottom-3 sm:max-w-sm z-40 card p-4 shadow-glow text-xs text-muted print:hidden"
    >
      <p className="text-text font-medium mb-1">Cookies & analytics</p>
      <p className="leading-relaxed">
        debugdaily uses local storage for your preferences. With your consent,
        tool pages also show Google ads (which set their own cookies) and we
        record anonymous tool-open counts to surface trending tools. See our{' '}
        <Link to="/privacy" className="text-accent hover:underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="flex gap-2 mt-3 justify-end flex-wrap">
        <button
          type="button"
          onClick={decline}
          className="px-3 h-8 rounded-md border border-border bg-surface text-muted text-xs hover:text-text hover:border-border-strong transition-colors"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={accept}
          className="px-3 h-8 rounded-md border border-accent/40 bg-accent/10 text-accent text-xs hover:bg-accent/15 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
