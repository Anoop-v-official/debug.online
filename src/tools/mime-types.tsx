import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['mime-types']!;

interface Entry {
  ext: string;
  mime: string;
  category: 'text' | 'image' | 'audio' | 'video' | 'app' | 'font';
  desc: string;
}

const MIMES: Entry[] = [
  { ext: 'html', mime: 'text/html', category: 'text', desc: 'HyperText Markup Language' },
  { ext: 'css', mime: 'text/css', category: 'text', desc: 'Cascading Style Sheets' },
  { ext: 'js', mime: 'application/javascript', category: 'app', desc: 'JavaScript source' },
  { ext: 'mjs', mime: 'application/javascript', category: 'app', desc: 'ES module' },
  { ext: 'json', mime: 'application/json', category: 'app', desc: 'JSON data' },
  { ext: 'xml', mime: 'application/xml', category: 'app', desc: 'XML data' },
  { ext: 'yaml', mime: 'application/yaml', category: 'app', desc: 'YAML data' },
  { ext: 'yml', mime: 'application/yaml', category: 'app', desc: 'YAML data' },
  { ext: 'txt', mime: 'text/plain', category: 'text', desc: 'Plain text' },
  { ext: 'csv', mime: 'text/csv', category: 'text', desc: 'Comma-separated values' },
  { ext: 'md', mime: 'text/markdown', category: 'text', desc: 'Markdown' },
  { ext: 'pdf', mime: 'application/pdf', category: 'app', desc: 'Portable Document Format' },
  { ext: 'zip', mime: 'application/zip', category: 'app', desc: 'Zip archive' },
  { ext: 'gz', mime: 'application/gzip', category: 'app', desc: 'gzip archive' },
  { ext: 'tar', mime: 'application/x-tar', category: 'app', desc: 'Tape archive' },
  { ext: '7z', mime: 'application/x-7z-compressed', category: 'app', desc: '7-Zip archive' },
  { ext: 'wasm', mime: 'application/wasm', category: 'app', desc: 'WebAssembly module' },
  { ext: 'png', mime: 'image/png', category: 'image', desc: 'PNG image' },
  { ext: 'jpg', mime: 'image/jpeg', category: 'image', desc: 'JPEG image' },
  { ext: 'jpeg', mime: 'image/jpeg', category: 'image', desc: 'JPEG image' },
  { ext: 'gif', mime: 'image/gif', category: 'image', desc: 'GIF image' },
  { ext: 'svg', mime: 'image/svg+xml', category: 'image', desc: 'Scalable Vector Graphics' },
  { ext: 'webp', mime: 'image/webp', category: 'image', desc: 'WebP image' },
  { ext: 'avif', mime: 'image/avif', category: 'image', desc: 'AV1 image format' },
  { ext: 'ico', mime: 'image/vnd.microsoft.icon', category: 'image', desc: 'Icon' },
  { ext: 'heic', mime: 'image/heic', category: 'image', desc: 'HEIC image' },
  { ext: 'mp3', mime: 'audio/mpeg', category: 'audio', desc: 'MP3 audio' },
  { ext: 'wav', mime: 'audio/wav', category: 'audio', desc: 'WAV audio' },
  { ext: 'ogg', mime: 'audio/ogg', category: 'audio', desc: 'Ogg audio' },
  { ext: 'flac', mime: 'audio/flac', category: 'audio', desc: 'FLAC audio' },
  { ext: 'opus', mime: 'audio/opus', category: 'audio', desc: 'Opus audio' },
  { ext: 'mp4', mime: 'video/mp4', category: 'video', desc: 'MP4 video' },
  { ext: 'webm', mime: 'video/webm', category: 'video', desc: 'WebM video' },
  { ext: 'mov', mime: 'video/quicktime', category: 'video', desc: 'QuickTime video' },
  { ext: 'mkv', mime: 'video/x-matroska', category: 'video', desc: 'Matroska video' },
  { ext: 'woff', mime: 'font/woff', category: 'font', desc: 'Web Open Font Format' },
  { ext: 'woff2', mime: 'font/woff2', category: 'font', desc: 'WOFF 2.0' },
  { ext: 'ttf', mime: 'font/ttf', category: 'font', desc: 'TrueType font' },
  { ext: 'otf', mime: 'font/otf', category: 'font', desc: 'OpenType font' },
  { ext: 'eot', mime: 'application/vnd.ms-fontobject', category: 'font', desc: 'Embedded OpenType' },
  { ext: 'doc', mime: 'application/msword', category: 'app', desc: 'Word document (legacy)' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'app', desc: 'Word document' },
  { ext: 'xls', mime: 'application/vnd.ms-excel', category: 'app', desc: 'Excel (legacy)' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'app', desc: 'Excel spreadsheet' },
  { ext: 'ppt', mime: 'application/vnd.ms-powerpoint', category: 'app', desc: 'PowerPoint (legacy)' },
  { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'app', desc: 'PowerPoint' },
];

export default function MimeTypes() {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\./, '');
    if (!s) return MIMES;
    return MIMES.filter(
      (m) =>
        m.ext.toLowerCase().includes(s) ||
        m.mime.toLowerCase().includes(s) ||
        m.desc.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input"
          placeholder="Search by extension, MIME, or description… (e.g. webp)"
          spellCheck={false}
        />
        <ul className="card divide-y divide-border max-h-[60vh] overflow-y-auto">
          {filtered.map((m, i) => (
            <li key={i} className="flex items-start gap-3 p-3">
              <span
                className={
                  'shrink-0 chip ' +
                  (m.category === 'image'
                    ? 'text-cyan border-cyan/30'
                    : m.category === 'video'
                    ? 'text-role-frontend border-role-frontend/30'
                    : m.category === 'audio'
                    ? 'text-role-trending border-role-trending/30'
                    : m.category === 'font'
                    ? 'text-role-security border-role-security/30'
                    : 'text-muted')
                }
              >
                .{m.ext}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-text break-all">{m.mime}</div>
                <div className="text-2xs text-subtle">{m.desc}</div>
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
