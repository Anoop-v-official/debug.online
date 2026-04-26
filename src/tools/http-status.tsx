import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['http-status']!;

interface Code {
  code: number;
  name: string;
  desc: string;
}

const CODES: Code[] = [
  { code: 100, name: 'Continue', desc: 'Server is willing to accept the request body.' },
  { code: 101, name: 'Switching Protocols', desc: 'Server agrees to switch protocols (e.g., to WebSocket).' },
  { code: 200, name: 'OK', desc: 'Standard success response.' },
  { code: 201, name: 'Created', desc: 'Request succeeded and a new resource was created.' },
  { code: 202, name: 'Accepted', desc: 'Request received but processing not complete.' },
  { code: 204, name: 'No Content', desc: 'Success, but the response has no body.' },
  { code: 206, name: 'Partial Content', desc: 'Range request satisfied.' },
  { code: 301, name: 'Moved Permanently', desc: 'Resource has a new permanent URL.' },
  { code: 302, name: 'Found', desc: 'Temporary redirect; method may change to GET.' },
  { code: 303, name: 'See Other', desc: 'Redirect using GET regardless of original method.' },
  { code: 304, name: 'Not Modified', desc: 'Cached version is still fresh.' },
  { code: 307, name: 'Temporary Redirect', desc: 'Temporary redirect; method must not change.' },
  { code: 308, name: 'Permanent Redirect', desc: 'Permanent redirect; method must not change.' },
  { code: 400, name: 'Bad Request', desc: 'Server cannot understand the request.' },
  { code: 401, name: 'Unauthorized', desc: 'Authentication required or failed.' },
  { code: 403, name: 'Forbidden', desc: 'Authenticated, but not allowed.' },
  { code: 404, name: 'Not Found', desc: 'No resource at that URL.' },
  { code: 405, name: 'Method Not Allowed', desc: 'Resource exists, but the method isn’t supported.' },
  { code: 409, name: 'Conflict', desc: 'Request conflicts with the current state of the resource.' },
  { code: 410, name: 'Gone', desc: 'Resource was here but is permanently removed.' },
  { code: 415, name: 'Unsupported Media Type', desc: 'Request payload format is not supported.' },
  { code: 418, name: "I'm a teapot", desc: 'A joke from RFC 2324. Frequently misused as a generic error.' },
  { code: 422, name: 'Unprocessable Entity', desc: 'Syntax OK, but semantically invalid.' },
  { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded.' },
  { code: 500, name: 'Internal Server Error', desc: 'Generic server-side failure.' },
  { code: 501, name: 'Not Implemented', desc: 'Server does not recognize the method.' },
  { code: 502, name: 'Bad Gateway', desc: 'Upstream server returned an invalid response.' },
  { code: 503, name: 'Service Unavailable', desc: 'Server is overloaded or down for maintenance.' },
  { code: 504, name: 'Gateway Timeout', desc: 'Upstream server did not respond in time.' },
  { code: 505, name: 'HTTP Version Not Supported', desc: 'HTTP version of the request is not supported.' },
];

function classOf(code: number): string {
  if (code < 200) return 'Informational';
  if (code < 300) return 'Success';
  if (code < 400) return 'Redirect';
  if (code < 500) return 'Client error';
  return 'Server error';
}

function classColor(code: number): string {
  if (code < 300) return 'text-accent';
  if (code < 400) return 'text-warning';
  if (code < 500) return 'text-warning';
  return 'text-error';
}

export default function HttpStatus() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CODES;
    return CODES.filter(
      (c) =>
        String(c.code).includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          placeholder="Filter by code or name…"
          spellCheck={false}
        />
        <ul className="card divide-y divide-border max-h-[480px] overflow-y-auto">
          {filtered.map((c) => (
            <li key={c.code} className="flex items-start gap-3 p-3">
              <span className={`font-mono text-base font-semibold w-12 ${classColor(c.code)}`}>
                {c.code}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  <span className="chip">{classOf(c.code)}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">{c.desc}</p>
              </div>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="p-4 text-center text-sm text-subtle">No matches.</li>
          ) : null}
        </ul>
      </div>
    </ToolFrame>
  );
}
