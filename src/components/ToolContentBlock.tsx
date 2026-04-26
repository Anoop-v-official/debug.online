import { type ToolContent } from '../lib/tools';

export function ToolContentBlock({ content, name }: { content: ToolContent; name: string }) {
  return (
    <section className="mt-6 space-y-5 text-sm leading-relaxed">
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-text">About {name}</h2>
        <p className="text-muted">{content.about}</p>
      </div>
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-text">When to use it</h2>
        <ul className="space-y-1 list-disc pl-5 text-muted marker:text-subtle">
          {content.useCases.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      </div>
      {content.gotchas && content.gotchas.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-text">Things to watch for</h2>
          <ul className="space-y-1 list-disc pl-5 text-muted marker:text-subtle">
            {content.gotchas.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
