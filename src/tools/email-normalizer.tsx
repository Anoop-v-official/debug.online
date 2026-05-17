import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['email-normalizer']!;

interface Result {
  raw: string;
  normalized: string;
  notes: string[];
}

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const ALIAS_DOMAINS = new Set([
  ...GMAIL_DOMAINS,
  'fastmail.com',
  'fastmail.fm',
  'protonmail.com',
  'proton.me',
  'hey.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
]);

function normalize(input: string): Result | null {
  const at = input.lastIndexOf('@');
  if (at < 1 || at === input.length - 1) return null;
  const localRaw = input.slice(0, at);
  const domainRaw = input.slice(at + 1).toLowerCase().trim();

  if (!/^[^\s@]+\.[^\s@]+$/.test(domainRaw)) return null;

  const notes: string[] = [];
  let local = localRaw.trim();

  if (local.toLowerCase() !== local) {
    local = local.toLowerCase();
    notes.push('Lowercased the local part (most providers treat it case-insensitively, but the RFC says case is significant).');
  }

  // Plus-tag stripping
  const plus = local.indexOf('+');
  if (plus !== -1 && ALIAS_DOMAINS.has(domainRaw)) {
    const tag = local.slice(plus + 1);
    local = local.slice(0, plus);
    notes.push(`Dropped "+${tag}" alias tag (delivered to the base address on ${domainRaw}).`);
  }

  // Gmail: strip dots in local part
  if (GMAIL_DOMAINS.has(domainRaw)) {
    const noDots = local.replace(/\./g, '');
    if (noDots !== local) {
      notes.push(`Removed dots from the local part (Gmail treats "${local}" and "${noDots}" as the same mailbox).`);
      local = noDots;
    }
    if (domainRaw === 'googlemail.com') {
      notes.push('Mapped googlemail.com → gmail.com (Google treats them as identical).');
    }
  }

  const domain = domainRaw === 'googlemail.com' ? 'gmail.com' : domainRaw;
  return { raw: input.trim(), normalized: `${local}@${domain}`, notes };
}

export default function EmailNormalizer() {
  const [input, setInput] = useState('Ada.Lovelace+newsletter@GMail.com');

  const result = useMemo(() => normalize(input), [input]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input }),
        applyState: (s) => {
          const v = s as { input?: string };
          if (typeof v.input === 'string') setInput(v.input);
        },
      }}
    >
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          spellCheck={false}
          placeholder="user+tag@gmail.com"
        />

        {result ? (
          <>
            <div className="card p-4 space-y-1">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
                Normalized
              </div>
              <div className="font-mono text-base text-accent break-all">
                {result.normalized}
              </div>
              {result.normalized !== result.raw ? (
                <div className="text-2xs text-subtle font-mono mt-1">
                  was: <span className="text-text">{result.raw}</span>
                </div>
              ) : (
                <div className="text-2xs text-subtle font-mono mt-1">
                  No changes — already canonical.
                </div>
              )}
            </div>

            {result.notes.length > 0 ? (
              <div className="card p-3">
                <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
                  What changed and why
                </div>
                <ul className="text-xs text-muted space-y-1 list-disc pl-5">
                  {result.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <OutputPane text={result.normalized} wrap copyLabel="Copy normalized" />
          </>
        ) : (
          <pre className="card p-3 text-xs font-mono text-error">
            Not a valid email address.
          </pre>
        )}

        <p className="text-2xs text-subtle font-mono">
          Useful for deduplicating signup lists or detecting alias-based abuse. Gmail's
          dot-and-plus rule is the most famous, but Fastmail, Proton, iCloud and Outlook
          all support +tag aliases too.
        </p>
      </div>
    </ToolFrame>
  );
}
