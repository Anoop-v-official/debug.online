import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { CopyButton } from '../components/CopyButton';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['markdown-table']!;

type Align = 'left' | 'right' | 'center' | 'none';

interface Column {
  header: string;
  align: Align;
}

function buildMarkdown(cols: Column[], rows: string[][]): string {
  const head = '| ' + cols.map((c) => c.header || ' ').join(' | ') + ' |';
  const sep =
    '| ' +
    cols
      .map((c) => {
        if (c.align === 'left') return ':---';
        if (c.align === 'right') return '---:';
        if (c.align === 'center') return ':---:';
        return '---';
      })
      .join(' | ') +
    ' |';
  const body = rows
    .map((r) => '| ' + cols.map((_, i) => r[i] ?? '').join(' | ') + ' |')
    .join('\n');
  return [head, sep, body].filter(Boolean).join('\n');
}

function parseCsv(input: string): { cols: Column[]; rows: string[][] } | null {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length === 0) return null;
  const split = (l: string): string[] => l.split(/\t|,/).map((c) => c.trim());
  const headers = split(lines[0]);
  const cols: Column[] = headers.map((h) => ({ header: h, align: 'none' }));
  const rows = lines.slice(1).map(split);
  return { cols, rows };
}

export default function MarkdownTable() {
  const [cols, setCols] = useState<Column[]>([
    { header: 'Tool', align: 'left' },
    { header: 'Search volume', align: 'right' },
    { header: 'Status', align: 'center' },
  ]);
  const [rows, setRows] = useState<string[][]>([
    ['JSON Formatter', '2.1M/mo', '✓ live'],
    ['JWT Decoder', '890K/mo', '✓ live'],
    ['Cron Builder', '720K/mo', '✓ live'],
  ]);
  const [csvImport, setCsvImport] = useState('');

  const md = useMemo(() => buildMarkdown(cols, rows), [cols, rows]);

  function setHeader(i: number, value: string) {
    setCols((prev) => prev.map((c, idx) => (idx === i ? { ...c, header: value } : c)));
  }
  function setAlign(i: number, value: Align) {
    setCols((prev) => prev.map((c, idx) => (idx === i ? { ...c, align: value } : c)));
  }
  function setCell(r: number, c: number, value: string) {
    setRows((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
      ),
    );
  }
  function addColumn() {
    setCols((prev) => [...prev, { header: `Col ${prev.length + 1}`, align: 'none' }]);
    setRows((prev) => prev.map((r) => [...r, '']));
  }
  function removeColumn(i: number) {
    if (cols.length <= 1) return;
    setCols((prev) => prev.filter((_, idx) => idx !== i));
    setRows((prev) => prev.map((r) => r.filter((_, idx) => idx !== i)));
  }
  function addRow() {
    setRows((prev) => [...prev, cols.map(() => '')]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }
  function importCsv() {
    const parsed = parseCsv(csvImport);
    if (!parsed) return;
    setCols(parsed.cols);
    setRows(parsed.rows);
    setCsvImport('');
  }

  return (
    <ToolFrame tool={tool} actions={<CopyButton text={md} />}>
      <div className="space-y-4">
        <div className="card p-3 overflow-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr>
                {cols.map((c, i) => (
                  <th key={i} className="border-b border-border p-2 align-bottom min-w-[140px]">
                    <input
                      value={c.header}
                      onChange={(e) => setHeader(i, e.target.value)}
                      className="w-full bg-transparent border-0 text-text font-semibold focus:outline-none focus:ring-0"
                    />
                    <div className="flex items-center gap-1 mt-1">
                      {(['left', 'center', 'right', 'none'] as Align[]).map((a) => (
                        <button
                          key={a}
                          type="button"
                          aria-label={`Align ${a}`}
                          onClick={() => setAlign(i, a)}
                          className={`px-1.5 py-0.5 rounded text-2xs ${
                            c.align === a ? 'bg-accent/20 text-accent' : 'text-subtle hover:text-text'
                          }`}
                        >
                          {a === 'none' ? '—' : a[0].toUpperCase()}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-label="Remove column"
                        onClick={() => removeColumn(i)}
                        className="ml-auto text-error text-2xs"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th className="border-b border-border p-2 w-10">
                  <button type="button" className="btn-ghost text-accent" onClick={addColumn}>
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {cols.map((_, ci) => (
                    <td key={ci} className="border-b border-border/50 p-1">
                      <input
                        value={row[ci] ?? ''}
                        onChange={(e) => setCell(ri, ci, e.target.value)}
                        className="w-full bg-transparent border-0 px-1 py-1 text-text focus:outline-none focus:bg-surface-2 rounded"
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      aria-label="Remove row"
                      onClick={() => removeRow(ri)}
                      className="text-error text-2xs"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn mt-2" onClick={addRow}>
            + Row
          </button>
        </div>

        <pre className="pane-wrap text-xs">{md}</pre>

        <details className="card p-3">
          <summary className="cursor-pointer text-2xs uppercase tracking-wide text-subtle font-mono">
            Import from CSV / TSV
          </summary>
          <textarea
            value={csvImport}
            onChange={(e) => setCsvImport(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="header1,header2,header3&#10;a,b,c&#10;d,e,f"
            className="textarea mt-2 font-mono text-xs min-h-0"
          />
          <button type="button" className="btn mt-2" onClick={importCsv} disabled={!csvImport.trim()}>
            Import
          </button>
        </details>
      </div>
    </ToolFrame>
  );
}
