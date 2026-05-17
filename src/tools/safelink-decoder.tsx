import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['safelink-decoder']!;

interface Decoded {
  original: string;
  wrapper: string;
}

const WRAPPERS: { name: string; matches: RegExp[]; extract: (u: URL) => string | null }[] = [
  {
    name: 'Microsoft Safe Links',
    matches: [/^https?:\/\/[^.]+\.safelinks\.protection\.outlook\.com\//i],
    extract: (u) => u.searchParams.get('url'),
  },
  {
    name: 'Mimecast URL Protection',
    matches: [/^https?:\/\/protect[^.]*\.mimecast\.com\//i],
    extract: (u) => {
      const q = u.searchParams.get('q');
      if (q) {
        try {
          return new URL(decodeURIComponent(q)).toString();
        } catch {
          return null;
        }
      }
      return null;
    },
  },
  {
    name: 'Proofpoint URL Defense',
    matches: [/^https?:\/\/urldefense\.(proofpoint\.)?com\//i],
    extract: (u) => {
      const u3 = u.searchParams.get('u');
      if (u3) {
        // Proofpoint v3 obfuscation: replace _ with /, then decode
        try {
          return decodeURIComponent(u3.replace(/_/g, '/'));
        } catch {
          return null;
        }
      }
      return null;
    },
  },
  {
    name: 'Google redirect',
    matches: [/^https?:\/\/(www\.)?google\.[^/]+\/url/i],
    extract: (u) => u.searchParams.get('q') || u.searchParams.get('url'),
  },
  {
    name: 'Twitter / X t.co',
    matches: [/^https?:\/\/t\.co\//i],
    extract: () => null, // t.co requires HEAD request; can't decode statically
  },
  {
    name: 'LinkedIn redirect',
    matches: [/^https?:\/\/(www\.)?linkedin\.com\/redir/i],
    extract: (u) => u.searchParams.get('url'),
  },
  {
    name: 'YouTube redirect',
    matches: [/^https?:\/\/(www\.)?youtube\.com\/redirect/i],
    extract: (u) => u.searchParams.get('q'),
  },
  {
    name: 'Generic ?url= / ?to= / ?q= / ?redirect=',
    matches: [/^https?:\/\//i],
    extract: (u) => {
      for (const k of ['url', 'to', 'q', 'redirect', 'target', 'dest', 'destination']) {
        const v = u.searchParams.get(k);
        if (v && /^https?:\/\//i.test(v)) return v;
      }
      return null;
    },
  },
];

function decode(raw: string): Decoded | { error: string } {
  try {
    const u = new URL(raw.trim());
    for (const w of WRAPPERS) {
      if (w.matches.some((m) => m.test(raw))) {
        const extracted = w.extract(u);
        if (extracted) {
          return { original: extracted, wrapper: w.name };
        }
      }
    }
    return { error: 'No wrapped URL detected — looks like a plain link already.' };
  } catch {
    return { error: 'Not a valid URL.' };
  }
}

export default function SafelinkDecoder() {
  const [input, setInput] = useState(
    'https://nam11.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Farticle%3Fid%3D42&data=…',
  );

  const result = useMemo(() => decode(input), [input]);

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
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          className="textarea font-mono text-xs min-h-0"
          placeholder="Paste a safelink (Outlook, Mimecast, Proofpoint, Google, LinkedIn…)"
        />

        {'error' in result ? (
          <pre className="card p-3 text-xs font-mono text-warning">{result.error}</pre>
        ) : (
          <>
            <div className="card p-4 space-y-2">
              <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
                Wrapper: <span className="text-accent">{result.wrapper}</span>
              </div>
              <div className="font-mono text-sm text-text break-all">{result.original}</div>
            </div>
            <OutputPane text={result.original} wrap copyLabel="Copy real URL" />
          </>
        )}

        <p className="text-2xs text-subtle font-mono">
          Decodes URL wrappers added by enterprise email security (Microsoft Safe Links, Mimecast, Proofpoint) and ad/redirect trackers (Google, LinkedIn, YouTube). t.co and bit.ly use server-side lookups — can't be decoded statically.
        </p>
      </div>
    </ToolFrame>
  );
}
