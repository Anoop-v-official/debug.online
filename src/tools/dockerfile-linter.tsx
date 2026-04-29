import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['dockerfile-linter']!;

interface Issue {
  line: number;
  rule: string;
  level: 'error' | 'warn' | 'info';
  message: string;
}

function lint(src: string): Issue[] {
  const issues: Issue[] = [];
  const lines = src.split('\n');
  let baseTagLine = -1;
  let hasUser = false;
  let hasFrom = false;
  let hasHealthcheck = false;
  const aptCommands: number[] = [];
  const runCount = lines.filter((l) => /^\s*RUN\b/i.test(l)).length;

  lines.forEach((raw, idx) => {
    const line = idx + 1;
    const t = raw.trim();
    if (!t || t.startsWith('#')) return;

    if (/^FROM\s/i.test(t)) {
      hasFrom = true;
      const m = /^FROM\s+([^\s]+)(?:\s+AS\s+\w+)?\s*$/i.exec(t);
      if (m) {
        const ref = m[1];
        if (!ref.includes(':') || /:latest$/.test(ref)) {
          issues.push({
            line,
            rule: 'DL3007',
            level: 'warn',
            message: 'Pin a specific image tag instead of `latest` (or no tag).',
          });
          baseTagLine = line;
        }
      }
    }

    if (/^USER\s/i.test(t)) hasUser = true;
    if (/^HEALTHCHECK\s/i.test(t)) hasHealthcheck = true;

    if (/^RUN\s+apt-get\s+install/i.test(t) && !/-y/.test(t)) {
      issues.push({
        line,
        rule: 'DL3009',
        level: 'warn',
        message: 'apt-get install needs -y in Dockerfiles (no TTY).',
      });
    }
    if (/^RUN\s+apt-get\s+install/i.test(t) && !/--no-install-recommends/.test(t)) {
      issues.push({
        line,
        rule: 'DL3015',
        level: 'info',
        message: 'Add --no-install-recommends to keep image size down.',
      });
    }
    if (/^RUN\s+apt-get/i.test(t)) aptCommands.push(line);

    if (/^RUN\s+apt-get\s+update/i.test(t) && !/&&\s*apt-get\s+install/.test(t)) {
      issues.push({
        line,
        rule: 'DL3009',
        level: 'warn',
        message: 'Run `apt-get update` and `apt-get install` in the same RUN to avoid stale cache layers.',
      });
    }

    if (/^RUN\s+sudo\b/i.test(t)) {
      issues.push({
        line,
        rule: 'DL3004',
        level: 'warn',
        message: 'Do not use sudo inside Docker — RUN runs as the container user.',
      });
    }

    if (/^ADD\s+http/i.test(t)) {
      issues.push({
        line,
        rule: 'DL3020',
        level: 'info',
        message: 'Prefer `RUN curl|wget` over `ADD <url>` for clarity.',
      });
    }

    if (/^MAINTAINER\b/i.test(t)) {
      issues.push({
        line,
        rule: 'DL4000',
        level: 'warn',
        message: 'MAINTAINER is deprecated — use `LABEL maintainer="…"` instead.',
      });
    }

    if (/^WORKDIR\s+\.\.?\b/i.test(t)) {
      issues.push({
        line,
        rule: 'DL3000',
        level: 'warn',
        message: 'WORKDIR should be an absolute path.',
      });
    }

    if (/^CMD\s+([^[].*)/.test(t)) {
      issues.push({
        line,
        rule: 'DL3025',
        level: 'info',
        message: 'Prefer JSON-array form for CMD (e.g. `CMD ["node", "server.js"]`).',
      });
    }

    if (/^EXPOSE\s+22\b/i.test(t)) {
      issues.push({
        line,
        rule: 'DL3011',
        level: 'warn',
        message: 'Avoid exposing SSH (port 22) from a container.',
      });
    }
  });

  if (!hasFrom) {
    issues.push({ line: 1, rule: 'DL3000', level: 'error', message: 'Dockerfile must start with a FROM instruction.' });
  }
  if (!hasUser) {
    issues.push({
      line: lines.length,
      rule: 'DL3002',
      level: 'warn',
      message: 'Last user is root. Add `USER nonroot` (or similar) to drop privileges.',
    });
  }
  if (!hasHealthcheck) {
    issues.push({
      line: lines.length,
      rule: 'DL3057',
      level: 'info',
      message: 'Consider adding a HEALTHCHECK so orchestrators know when the container is ready.',
    });
  }
  if (runCount > 6) {
    issues.push({
      line: 1,
      rule: 'DL3059',
      level: 'info',
      message: `${runCount} RUN instructions — consider chaining with && to reduce layers.`,
    });
  }
  void baseTagLine;
  void aptCommands;
  return issues.sort((a, b) => a.line - b.line);
}

const SAMPLE = `FROM node:latest
MAINTAINER you@example.com

RUN apt-get update
RUN apt-get install curl
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 22
CMD npm start
`;

export default function DockerfileLinter() {
  const [input, setInput] = useState(SAMPLE);
  const issues = useMemo(() => lint(input), [input]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          spellCheck={false}
          className="textarea font-mono text-xs"
        />
        <div className="card p-3">
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono mb-2">
            {issues.length} issue{issues.length === 1 ? '' : 's'} found
          </div>
          {issues.length === 0 ? (
            <div className="text-sm text-accent">✓ No issues detected.</div>
          ) : (
            <ul className="space-y-1.5 font-mono text-xs">
              {issues.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span
                    className={
                      'shrink-0 w-12 text-2xs uppercase tracking-wider ' +
                      (i.level === 'error'
                        ? 'text-error'
                        : i.level === 'warn'
                        ? 'text-warning'
                        : 'text-cyan')
                    }
                  >
                    {i.level}
                  </span>
                  <span className="shrink-0 text-subtle">L{i.line}</span>
                  <span className="shrink-0 text-subtle">{i.rule}</span>
                  <span className="text-text">{i.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-2xs text-subtle font-mono">
          Rule IDs (DL3xxx) follow Hadolint conventions. This is a fast in-browser subset; for full coverage run Hadolint in CI.
        </p>
      </div>
    </ToolFrame>
  );
}
