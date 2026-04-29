import { useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['responsive-tester']!;

interface Device {
  name: string;
  width: number;
  height: number;
  scale: number;
  group: 'mobile' | 'tablet' | 'desktop';
}

const DEVICES: Device[] = [
  { name: 'iPhone SE', width: 375, height: 667, scale: 2, group: 'mobile' },
  { name: 'iPhone 14', width: 390, height: 844, scale: 3, group: 'mobile' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, scale: 3, group: 'mobile' },
  { name: 'Pixel 7', width: 412, height: 915, scale: 2.625, group: 'mobile' },
  { name: 'Galaxy S23', width: 360, height: 780, scale: 3, group: 'mobile' },
  { name: 'iPad Mini', width: 768, height: 1024, scale: 2, group: 'tablet' },
  { name: 'iPad Pro 11', width: 834, height: 1194, scale: 2, group: 'tablet' },
  { name: 'Desktop 1280', width: 1280, height: 800, scale: 1, group: 'desktop' },
  { name: 'Desktop 1440', width: 1440, height: 900, scale: 1, group: 'desktop' },
  { name: 'Desktop 1920', width: 1920, height: 1080, scale: 1, group: 'desktop' },
];

export default function ResponsiveTester() {
  const [url, setUrl] = useState('https://example.com');
  const [submitted, setSubmitted] = useState('https://example.com');
  const [filter, setFilter] = useState<'all' | 'mobile' | 'tablet' | 'desktop'>('all');

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    let next = url.trim();
    if (next && !/^https?:\/\//i.test(next)) next = 'https://' + next;
    setSubmitted(next);
  }

  const visible = filter === 'all' ? DEVICES : DEVICES.filter((d) => d.group === filter);

  return (
    <ToolFrame tool={tool}>
      <form onSubmit={go} className="flex flex-wrap items-center gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input flex-1 min-w-[240px] font-mono"
          placeholder="https://example.com"
          spellCheck={false}
        />
        <button type="submit" className="btn-accent">
          Load
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {(['all', 'mobile', 'tablet', 'desktop'] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={
              'px-3 py-1.5 rounded-md text-xs border transition-colors ' +
              (filter === g
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-surface border-border text-muted hover:border-border-strong hover:text-text')
            }
            onClick={() => setFilter(g)}
          >
            {g[0].toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {visible.map((d) => (
          <Frame key={d.name} device={d} url={submitted} />
        ))}
      </div>

      <p className="text-2xs text-subtle font-mono mt-6">
        Sites that send `X-Frame-Options: DENY` (e.g. google.com) refuse to load in iframes — that's a browser limitation, not a bug here.
      </p>
    </ToolFrame>
  );
}

function Frame({ device, url }: { device: Device; url: string }) {
  // Render at 30% scale to fit the layout while preserving aspect.
  const containerScale = 0.32;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs font-mono">
        <span className="text-text">{device.name}</span>
        <span className="text-subtle">
          {device.width}×{device.height}
        </span>
      </div>
      <div
        className="rounded-lg border border-border overflow-hidden bg-surface-2"
        style={{
          width: device.width * containerScale,
          height: device.height * containerScale,
        }}
      >
        <iframe
          src={url}
          title={device.name}
          sandbox="allow-same-origin allow-scripts allow-forms"
          style={{
            width: device.width,
            height: device.height,
            transform: `scale(${containerScale})`,
            transformOrigin: 'top left',
            border: 0,
          }}
        />
      </div>
    </div>
  );
}
