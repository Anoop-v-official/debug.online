import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['markdown-preview']!;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(/`([^`]+?)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return out;
}

function render(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  let inList = false;
  let inCode = false;
  let codeBuf: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        inCode = false;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++;
      continue;
    }
    const li = /^[-*+]\s+(.*)$/.exec(line);
    if (li) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(li[1])}</li>`);
      i++;
      continue;
    }
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
    if (line.trim() === '') {
      out.push('');
      i++;
      continue;
    }
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  if (inList) out.push('</ul>');
  if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  return out.join('\n');
}

const SAMPLE = `# debug.online

A toolkit for **IT folks** who like things *fast*.

- DNS, SSL, JWT
- JSON, regex, base64
- Smart context insights

\`\`\`
npm install
npm run dev
\`\`\`

[Read more](https://example.com)`;

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE);
  const html = useMemo(() => render(input), [input]);

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
      <SplitPane
        leftLabel="Markdown"
        rightLabel="Preview"
        left={
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            className="textarea"
          />
        }
        right={
          <div
            className="card p-4 prose prose-invert max-w-none text-sm overflow-auto min-h-[280px] max-h-[60vh]
                       [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm
                       [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium
                       [&_h1]:mt-0 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:mt-2 [&_h3]:mb-1
                       [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-5 [&_ul]:list-disc
                       [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2
                       [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:rounded [&_code]:text-2xs [&_code]:font-mono
                       [&_pre]:bg-surface-2 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:my-2
                       [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:text-xs"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        }
      />
      <p className="mt-3 text-2xs text-subtle font-mono">
        Subset only: headings, bold, italic, code, links, lists. No raw HTML, no tables.
      </p>
    </ToolFrame>
  );
}
