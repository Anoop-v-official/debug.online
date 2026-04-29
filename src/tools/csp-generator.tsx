import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['csp-generator']!;

const DIRECTIVES = [
  { key: 'default-src', label: "Default for everything not specified" },
  { key: 'script-src', label: 'JavaScript sources' },
  { key: 'style-src', label: 'CSS sources' },
  { key: 'img-src', label: 'Image sources' },
  { key: 'font-src', label: 'Font sources' },
  { key: 'connect-src', label: 'XHR / fetch / WebSocket' },
  { key: 'frame-src', label: 'iframe sources' },
  { key: 'frame-ancestors', label: 'Who can frame this site' },
  { key: 'object-src', label: '<object>, <embed>, <applet>' },
  { key: 'base-uri', label: '<base href>' },
  { key: 'form-action', label: 'Form submission targets' },
] as const;

type Key = (typeof DIRECTIVES)[number]['key'];

const PRESET_TIGHT: Record<Key, string> = {
  'default-src': "'self'",
  'script-src': "'self'",
  'style-src': "'self'",
  'img-src': "'self' data:",
  'font-src': "'self'",
  'connect-src': "'self'",
  'frame-src': "'none'",
  'frame-ancestors': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
};

export default function CspGenerator() {
  const [values, setValues] = useState<Record<Key, string>>(PRESET_TIGHT);
  const [reportOnly, setReportOnly] = useState(false);
  const [reportUri, setReportUri] = useState('');

  const policy = useMemo(() => {
    const parts = DIRECTIVES.map((d) => {
      const v = values[d.key].trim();
      if (!v) return null;
      return `${d.key} ${v}`;
    }).filter(Boolean) as string[];
    if (reportUri.trim()) parts.push(`report-uri ${reportUri.trim()}`);
    return parts.join('; ');
  }, [values, reportUri]);

  const headerName = reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  return (
    <ToolFrame tool={tool} actions={<CopyButton text={`${headerName}: ${policy}`} />}>
      <div className="space-y-4">
        <div className="card p-3 space-y-2">
          {DIRECTIVES.map((d) => (
            <label key={d.key} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 items-start">
              <div>
                <div className="text-xs font-mono text-text">{d.key}</div>
                <div className="text-2xs text-subtle">{d.label}</div>
              </div>
              <input
                value={values[d.key]}
                onChange={(e) => setValues((v) => ({ ...v, [d.key]: e.target.value }))}
                className="input font-mono text-xs"
                spellCheck={false}
                placeholder={`'self' https://cdn.example.com`}
              />
            </label>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-muted flex items-center gap-2">
            <input
              type="checkbox"
              checked={reportOnly}
              onChange={(e) => setReportOnly(e.target.checked)}
              className="accent-accent"
            />
            Report-Only mode
          </label>
          <label className="text-xs text-muted flex items-center gap-2">
            report-uri
            <input
              value={reportUri}
              onChange={(e) => setReportUri(e.target.value)}
              className="input flex-1 font-mono text-xs"
              spellCheck={false}
              placeholder="https://csp.example.com/report"
            />
          </label>
        </div>

        <pre className="pane-wrap">{`${headerName}: ${policy}`}</pre>

        <p className="text-2xs text-subtle font-mono">
          Tighten incrementally — start with Report-Only, watch the violation reports for a week, then enforce. Avoid `'unsafe-inline'` and `'unsafe-eval'` in production.
        </p>
      </div>
    </ToolFrame>
  );
}
