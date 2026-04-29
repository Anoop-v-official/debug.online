import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['email-header-analyzer']!;

interface Hop {
  from: string;
  by: string;
  delay?: string;
  raw: string;
}

interface Auth {
  spf: string;
  dkim: string;
  dmarc: string;
}

function unfold(raw: string): string[] {
  const lines = raw.split(/\r?\n/);
  const out: string[] = [];
  for (const l of lines) {
    if (/^[ \t]/.test(l) && out.length) {
      out[out.length - 1] += ' ' + l.trim();
    } else {
      out.push(l);
    }
  }
  return out;
}

function parse(raw: string): { headers: Map<string, string[]>; hops: Hop[]; auth: Auth } {
  const headers = new Map<string, string[]>();
  const hops: Hop[] = [];
  for (const line of unfold(raw)) {
    const m = /^([!-9;-~]+):\s?(.*)$/.exec(line);
    if (!m) continue;
    const k = m[1].toLowerCase();
    const list = headers.get(k) ?? [];
    list.push(m[2]);
    headers.set(k, list);
  }
  const received = (headers.get('received') ?? []).slice().reverse();
  for (const r of received) {
    const fromM = /from\s+([^\s]+)/i.exec(r);
    const byM = /by\s+([^\s]+)/i.exec(r);
    hops.push({
      from: fromM ? fromM[1] : '?',
      by: byM ? byM[1] : '?',
      raw: r,
    });
  }
  const authResults = (headers.get('authentication-results') ?? []).join('; ');
  const spf = /spf=([a-z]+)/i.exec(authResults)?.[1] ?? '?';
  const dkim = /dkim=([a-z]+)/i.exec(authResults)?.[1] ?? '?';
  const dmarc = /dmarc=([a-z]+)/i.exec(authResults)?.[1] ?? '?';
  return { headers, hops, auth: { spf, dkim, dmarc } };
}

const SAMPLE = `Return-Path: <newsletter@example.com>
Received: from mail-relay.example.com (mail-relay.example.com [192.0.2.10])
\tby mx.recipient.com with ESMTPS id abc123
\t(version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256)
\tfor <user@recipient.com>; Tue, 14 Apr 2026 10:00:01 -0700 (PDT)
Authentication-Results: mx.recipient.com;
\tdkim=pass header.i=@example.com header.s=key1;
\tspf=pass smtp.mailfrom=newsletter@example.com;
\tdmarc=pass (p=REJECT) header.from=example.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com; s=key1; ...
From: "Example Newsletter" <newsletter@example.com>
To: <user@recipient.com>
Subject: Hello there
Date: Tue, 14 Apr 2026 17:00:00 +0000
Message-ID: <abc.123@example.com>
`;

function colorFor(v: string): string {
  if (v === 'pass') return 'text-accent';
  if (v === 'fail' || v === 'softfail' || v === 'permerror') return 'text-error';
  if (v === 'neutral' || v === 'none') return 'text-warning';
  return 'text-subtle';
}

export default function EmailHeaderAnalyzer() {
  const [input, setInput] = useState(SAMPLE);
  const result = useMemo(() => parse(input), [input]);

  const headerRows = (
    [
      'from',
      'to',
      'subject',
      'date',
      'message-id',
      'return-path',
      'reply-to',
      'list-unsubscribe',
    ] as const
  )
    .map((k) => ({ key: k, value: (result.headers.get(k) ?? [])[0] }))
    .filter((r) => r.value !== undefined);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          className="textarea font-mono text-xs"
          placeholder="Paste full raw email headers here…"
        />

        <div className="grid sm:grid-cols-3 gap-3">
          <Auth title="SPF" value={result.auth.spf} />
          <Auth title="DKIM" value={result.auth.dkim} />
          <Auth title="DMARC" value={result.auth.dmarc} />
        </div>

        <div className="card p-3">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
            Headers
          </div>
          <ul className="text-xs font-mono space-y-1">
            {headerRows.map((r) => (
              <li key={r.key} className="flex gap-2">
                <span className="text-subtle w-32 shrink-0">{r.key}</span>
                <span className="text-text break-all">{r.value}</span>
              </li>
            ))}
            {headerRows.length === 0 && (
              <li className="text-subtle">No standard headers parsed.</li>
            )}
          </ul>
        </div>

        <div className="card p-3">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
            Routing path ({result.hops.length} hop{result.hops.length === 1 ? '' : 's'})
          </div>
          {result.hops.length === 0 ? (
            <div className="text-sm text-subtle">No Received headers found.</div>
          ) : (
            <ol className="text-xs font-mono space-y-1.5">
              {result.hops.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-subtle">{i + 1}.</span>
                  <span className="text-accent">{h.from}</span>
                  <span className="text-subtle">→</span>
                  <span className="text-text">{h.by}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </ToolFrame>
  );
}

function Auth({ title, value }: { title: string; value: string }) {
  return (
    <div className="card p-3">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">{title}</div>
      <div className={`mt-1 text-base font-mono font-semibold ${colorFor(value)}`}>
        {value === '?' ? 'unknown' : value}
      </div>
    </div>
  );
}
