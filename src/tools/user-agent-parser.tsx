import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['user-agent-parser']!;

interface Parsed {
  browser: { name: string; version?: string };
  os: { name: string; version?: string };
  device: 'Mobile' | 'Tablet' | 'Desktop' | 'Bot';
}

function parse(ua: string): Parsed {
  const s = ua.trim();
  let browser: Parsed['browser'] = { name: 'Unknown' };
  let os: Parsed['os'] = { name: 'Unknown' };
  let device: Parsed['device'] = 'Desktop';

  if (/bot|spider|crawler|crawling/i.test(s)) device = 'Bot';
  else if (/iPad|Tablet/i.test(s)) device = 'Tablet';
  else if (/Mobi|iPhone|Android/i.test(s)) device = 'Mobile';

  let m: RegExpExecArray | null;
  if ((m = /Edg\/([\d.]+)/.exec(s))) browser = { name: 'Edge', version: m[1] };
  else if ((m = /OPR\/([\d.]+)/.exec(s))) browser = { name: 'Opera', version: m[1] };
  else if ((m = /Firefox\/([\d.]+)/.exec(s))) browser = { name: 'Firefox', version: m[1] };
  else if ((m = /Chrome\/([\d.]+)/.exec(s))) browser = { name: 'Chrome', version: m[1] };
  else if ((m = /Version\/([\d.]+).*Safari/.exec(s))) browser = { name: 'Safari', version: m[1] };

  if ((m = /Windows NT ([\d.]+)/.exec(s))) os = { name: 'Windows', version: m[1] };
  else if ((m = /Mac OS X ([\d_]+)/.exec(s))) os = { name: 'macOS', version: m[1].replace(/_/g, '.') };
  else if ((m = /Android ([\d.]+)/.exec(s))) os = { name: 'Android', version: m[1] };
  else if ((m = /iPhone OS ([\d_]+)/.exec(s))) os = { name: 'iOS', version: m[1].replace(/_/g, '.') };
  else if (/Linux/.test(s)) os = { name: 'Linux' };

  return { browser, os, device };
}

export default function UserAgentParser() {
  const defaultUa = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const [input, setInput] = useState(defaultUa);
  const parsed = useMemo(() => parse(input), [input]);

  return (
    <ToolFrame
      tool={tool}
      actions={
        <button
          type="button"
          className="btn"
          onClick={() => setInput(navigator.userAgent)}
        >
          Use mine
        </button>
      }
    >
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          className="textarea font-mono text-xs"
        />
        <div className="card p-3 text-sm font-mono space-y-1.5">
          <Row
            label="Browser"
            value={`${parsed.browser.name}${parsed.browser.version ? ' ' + parsed.browser.version : ''}`}
          />
          <Row
            label="OS"
            value={`${parsed.os.name}${parsed.os.version ? ' ' + parsed.os.version : ''}`}
          />
          <Row label="Device" value={parsed.device} />
        </div>
      </div>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-subtle text-2xs uppercase tracking-wide w-20 shrink-0">
        {label}
      </span>
      <span className="text-text break-all">{value}</span>
    </div>
  );
}
