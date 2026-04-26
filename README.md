# debug.online

The IT toolkit that doesn't just show you data — it helps you understand it.

23 instant tools (DNS, SSL, JWT, JSON, regex, …) with an AI-powered Smart Context
engine that explains every result in plain English, flags anomalies, and suggests
the next move. Built on React 18 + Vite + Tailwind, deployed on Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — see "Environment" below
npm run dev                  # http://localhost:5173
```

The serverless functions in `api/` need Vercel's local runtime to resolve:

```bash
npx vercel dev
```

## Environment

| Variable             | What it does                                                       | Required |
| -------------------- | ------------------------------------------------------------------ | -------- |
| `ANTHROPIC_API_KEY`  | Powers the AI Smart Context insights (`/api/insights`).            | optional |
| `KV_REST_API_URL`    | Vercel KV — backing store for share links (`/api/share`).          | optional |
| `KV_REST_API_TOKEN`  | Vercel KV bearer token.                                            | optional |
| `VITE_CARBON_SERVE`  | Carbon Ads serve code. Ad slot is hidden when unset.               | optional |

When KV is unset, share links work in-memory (lost on cold-start) — fine for dev.
When `ANTHROPIC_API_KEY` is unset, the InsightPanel shows a friendly placeholder.

## Structure

```
api/                      # Vercel serverless (Node) — DNS, SSL, share, AI
src/components/           # CommandPalette, InsightPanel, ShareButton, ToolGrid, …
src/tools/                # One file per tool (lazy-loaded route chunks)
src/lib/tools.ts          # Single source of truth — all tool metadata
src/store/                # Zustand stores (theme, favorites, history)
src/styles/globals.css    # Design system (Tailwind layers + tokens)
```

## Adding a tool

1. Create `src/tools/my-tool.tsx` (export default a React component).
2. Register it in `src/lib/tools.ts` with `slug`, `name`, `keywords`, `category`.
3. Use `<ToolFrame>`, `<SplitPane>`, `<InsightPanel>` for the standard layout.

That's it — the tool shows up on the homepage, in `⌘K`, and gets its own route at
`/tools/<slug>` with code-splitting.

## Keyboard

| Key                | Action                       |
| ------------------ | ---------------------------- |
| `⌘K` / `Ctrl+K`    | Command palette              |
| `?`                | Show all shortcuts           |
| `g` then `h`       | Go home                      |
| `Esc`              | Close palette / overlay      |

## Performance targets

- Lighthouse 95+ across the board
- First contentful paint < 0.8 s
- Every client-side tool < 50 ms response
- Each tool is its own lazy-loaded chunk
