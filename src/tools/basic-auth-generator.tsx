import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['basic-auth-generator']!;

function encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export default function BasicAuthGenerator() {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('hunter2');

  const value = useMemo(() => encode(`${user}:${pass}`), [user, pass]);
  const header = `Authorization: Basic ${value}`;
  const curl = `curl -u ${user}:${pass} https://api.example.com`;

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ user }),
        applyState: (s) => {
          const v = s as { user?: string };
          if (typeof v.user === 'string') setUser(v.user);
        },
      }}
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm text-muted">
            Username
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="input mt-1 font-mono"
              spellCheck={false}
            />
          </label>
          <label className="text-sm text-muted">
            Password
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="input mt-1 font-mono"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              Authorization header
            </div>
            <OutputPane text={header} wrap copyLabel="Copy header" />
          </div>
          <div>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              curl equivalent
            </div>
            <OutputPane text={curl} wrap copyLabel="Copy curl" />
          </div>
          <div>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-1">
              Base64 value only
            </div>
            <OutputPane text={value} wrap copyLabel="Copy value" />
          </div>
        </div>

        <p className="text-2xs text-subtle font-mono">
          Password is never sent anywhere — Base64 happens entirely in your browser.
        </p>
      </div>
    </ToolFrame>
  );
}
