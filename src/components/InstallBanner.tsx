import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { getConsent, subscribeConsent } from '../lib/consent';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSED_KEY = 'debugdaily.install-banner-dismissed';
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function recentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [consentSettled, setConsentSettled] = useState(getConsent() !== 'pending');

  // Watch consent — only allow the install prompt to appear after the cookie
  // banner has been dismissed, so the two never overlap on first visit.
  useEffect(() => {
    return subscribeConsent((s) => {
      if (s !== 'pending') setConsentSettled(true);
    });
  }, []);

  useEffect(() => {
    if (recentlyDismissed()) return;

    function onPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setPromptEvent(null);
      setVisible(false);
    }

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Surface the banner only after BOTH conditions are met: we have a prompt
  // event waiting AND the cookie banner is gone. The 800ms delay avoids
  // fighting first-paint when both clear at the same time.
  useEffect(() => {
    if (!promptEvent) return;
    if (!consentSettled) return;
    const id = window.setTimeout(() => setVisible(true), 800);
    return () => window.clearTimeout(id);
  }, [promptEvent, consentSettled]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome !== 'accepted') {
        dismiss();
      }
    } catch {
      dismiss();
    } finally {
      setPromptEvent(null);
      setVisible(false);
    }
  }

  if (!visible || !promptEvent) return null;

  return (
    <div
      role="dialog"
      aria-label="Install debugdaily"
      className="fixed bottom-4 right-4 z-40 max-w-sm animate-slide-up"
    >
      <div className="card p-3 pr-2 flex items-center gap-3 shadow-glow">
        <span
          aria-hidden
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md border border-accent/40 bg-accent/10 text-accent"
        >
          <Download className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text">Install debugdaily</div>
          <div className="text-2xs text-subtle">
            Add to your home screen for one-tap access.
          </div>
        </div>
        <button
          type="button"
          onClick={install}
          className="px-3 h-8 rounded-md border border-accent/40 bg-accent/10 text-accent text-sm hover:bg-accent/15 transition-colors"
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="w-8 h-8 inline-flex items-center justify-center text-subtle hover:text-text"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
