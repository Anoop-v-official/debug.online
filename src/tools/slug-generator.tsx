import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['slug-generator']!;

function slugify(input: string, sep: string, lower: boolean, stripStop: boolean): string {
  let s = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ` and `)
    .replace(/[^a-zA-Z0-9\s-_]/g, ' ')
    .replace(/[_-]+/g, ' ');
  if (stripStop) {
    const stop = new Set([
      'a','an','and','as','at','but','by','for','if','in','of','on','or','the','to','with',
    ]);
    s = s
      .split(/\s+/)
      .filter((w, i) => i === 0 || !stop.has(w.toLowerCase()))
      .join(' ');
  }
  s = s.trim().split(/\s+/).join(sep);
  return lower ? s.toLowerCase() : s;
}

export default function SlugGenerator() {
  const [input, setInput] = useState('How DNS Records Actually Work: A, AAAA, MX, TXT Explained!');
  const [sep, setSep] = useState('-');
  const [lower, setLower] = useState(true);
  const [stripStop, setStripStop] = useState(false);

  const slug = useMemo(() => slugify(input, sep, lower, stripStop), [input, sep, lower, stripStop]);

  return (
    <ToolFrame tool={tool} actions={<CopyButton text={slug} />}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          className="textarea font-mono text-xs min-h-0"
          placeholder="A title with spaces, accents, & symbols"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="text-xs text-muted flex items-center gap-2">
            Separator
            <select
              value={sep}
              onChange={(e) => setSep(e.target.value)}
              className="input w-auto py-1.5"
            >
              <option value="-">- (dash)</option>
              <option value="_">_ (underscore)</option>
              <option value=".">. (dot)</option>
              <option value="">none</option>
            </select>
          </label>
          <label className="text-xs text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={lower}
              onChange={(e) => setLower(e.target.checked)}
              className="accent-accent"
            />
            lowercase
          </label>
          <label className="text-xs text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={stripStop}
              onChange={(e) => setStripStop(e.target.checked)}
              className="accent-accent"
            />
            strip stop-words (a, the, of…)
          </label>
        </div>

        <div className="card p-4">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">Slug</div>
          <div className="font-mono text-base text-text break-all">
            {slug || <span className="text-subtle">empty</span>}
          </div>
        </div>

        <p className="text-2xs text-subtle font-mono">
          Strips diacritics (NFKD), replaces &amp; with "and", and collapses runs of separators. Pure URL-safe ASCII output.
        </p>
      </div>
    </ToolFrame>
  );
}
