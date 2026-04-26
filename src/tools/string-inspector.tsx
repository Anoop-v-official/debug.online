import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';
import { utf8ByteSize, formatBytes } from '../lib/byteSize';

const tool = toolBySlug['string-inspector']!;

export default function StringInspector() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog.');

  const stats = useMemo(() => {
    const codepoints = [...input];
    const lines = input.length === 0 ? 0 : input.split('\n').length;
    const words = input.trim().length === 0 ? 0 : input.trim().split(/\s+/).length;
    return {
      chars: input.length,
      codepoints: codepoints.length,
      bytes: utf8ByteSize(input),
      lines,
      words,
      uppercase: (input.match(/\p{Lu}/gu) || []).length,
      lowercase: (input.match(/\p{Ll}/gu) || []).length,
      digits: (input.match(/\d/g) || []).length,
      whitespace: (input.match(/\s/g) || []).length,
    };
  }, [input]);

  return (
    <ToolFrame tool={tool}>
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          spellCheck={false}
          className="textarea"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <Stat label="Characters" value={stats.chars} />
          <Stat label="Codepoints" value={stats.codepoints} />
          <Stat label="UTF-8 bytes" value={formatBytes(stats.bytes)} />
          <Stat label="Lines" value={stats.lines} />
          <Stat label="Words" value={stats.words} />
          <Stat label="Uppercase" value={stats.uppercase} />
          <Stat label="Lowercase" value={stats.lowercase} />
          <Stat label="Digits" value={stats.digits} />
          <Stat label="Whitespace" value={stats.whitespace} />
        </div>
      </div>
    </ToolFrame>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-3">
      <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
        {label}
      </div>
      <div className="text-lg font-mono text-text mt-0.5">{value}</div>
    </div>
  );
}
