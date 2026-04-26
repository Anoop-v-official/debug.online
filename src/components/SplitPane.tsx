import { type ReactNode } from 'react';

export function SplitPane({
  left,
  right,
  leftLabel,
  rightLabel,
}: {
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-1.5">
        {leftLabel ? (
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
            {leftLabel}
          </div>
        ) : null}
        {left}
      </div>
      <div className="space-y-1.5">
        {rightLabel ? (
          <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
            {rightLabel}
          </div>
        ) : null}
        {right}
      </div>
    </div>
  );
}
