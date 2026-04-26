import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { SplitPane } from '../components/SplitPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['diff-viewer']!;

type Op = { kind: 'eq' | 'add' | 'del'; left?: string; right?: string };

function diff(a: string, b: string): Op[] {
  const A = a.split('\n');
  const B = b.split('\n');
  const m = A.length;
  const n = B.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (A[i] === B[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      ops.push({ kind: 'eq', left: A[i], right: B[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: 'del', left: A[i] });
      i++;
    } else {
      ops.push({ kind: 'add', right: B[j] });
      j++;
    }
  }
  while (i < m) ops.push({ kind: 'del', left: A[i++] });
  while (j < n) ops.push({ kind: 'add', right: B[j++] });
  return ops;
}

export default function DiffViewer() {
  const [a, setA] = useState('alpha\nbeta\ngamma');
  const [b, setB] = useState('alpha\nbeta-prime\ngamma\ndelta');
  const ops = useMemo(() => diff(a, b), [a, b]);

  return (
    <ToolFrame tool={tool}>
      <SplitPane
        leftLabel="A"
        rightLabel="B"
        left={
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea"
          />
        }
        right={
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={10}
            spellCheck={false}
            className="textarea"
          />
        }
      />
      <div className="mt-4 card p-0 overflow-hidden">
        <div className="text-2xs uppercase tracking-wide text-subtle font-mono px-3 py-2 border-b border-border">
          Unified diff
        </div>
        <pre className="text-xs font-mono p-3 overflow-auto max-h-[300px]">
          {ops.map((op, i) => {
            if (op.kind === 'eq')
              return (
                <span key={i} className="block text-muted">
                  {'  '}
                  {op.left}
                </span>
              );
            if (op.kind === 'del')
              return (
                <span key={i} className="block text-error">
                  {'- '}
                  {op.left}
                </span>
              );
            return (
              <span key={i} className="block text-accent">
                {'+ '}
                {op.right}
              </span>
            );
          })}
        </pre>
      </div>
    </ToolFrame>
  );
}
