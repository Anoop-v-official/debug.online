import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Insight {
  summary: string;
  notes: string[];
  source: 'ai' | 'fallback';
}

const MAX_BODY_CHARS = 8000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-haiku-4-5-20251001';

function fallback(tool: string): Insight {
  const tips: Record<string, Insight> = {
    'json-format': {
      summary:
        'JSON formatting is purely structural — pretty-printing makes diffs and reviews easier without changing meaning.',
      notes: [
        'Minified output is best for transport; pretty-printed for humans.',
        'Trailing commas and comments are not valid JSON.',
      ],
      source: 'fallback',
    },
    'jwt-decode': {
      summary:
        'A JWT is base64url-encoded JSON header, payload and signature. Decoding does NOT verify the signature.',
      notes: [
        'Treat anything in the payload as untrusted until you verify the signature server-side.',
        'Watch for `exp`, `iat`, `nbf` and `aud` when debugging auth issues.',
      ],
      source: 'fallback',
    },
    'dns-lookup': {
      summary:
        'DNS records map a name to addresses, mail servers, text claims and more. TTL controls how long resolvers cache.',
      notes: [
        'TXT records often hold SPF, DKIM, and domain-verification tokens.',
        'A short TTL is friendly to changes; a long TTL is friendly to load.',
      ],
      source: 'fallback',
    },
    'ssl-check': {
      summary:
        'TLS certificates bind a domain to a public key, signed by a chain ending at a trusted CA.',
      notes: [
        'Renew well before "days left" hits zero — usually 30 days or sooner.',
        'A short SAN list can silently break alternate hostnames.',
      ],
      source: 'fallback',
    },
  };
  return (
    tips[tool] ?? {
      summary:
        'Set ANTHROPIC_API_KEY to enable AI-powered context for every tool. The tool itself works regardless.',
      notes: [],
      source: 'fallback',
    }
  );
}

async function aiInsight(
  tool: string,
  input: unknown,
  output: unknown,
): Promise<Insight | null> {
  if (!ANTHROPIC_API_KEY) return null;

  const inputStr = JSON.stringify(input).slice(0, MAX_BODY_CHARS);
  const outputStr = JSON.stringify(output).slice(0, MAX_BODY_CHARS);

  const prompt = `You are explaining the result of an IT/dev tool. Tool: ${tool}.
Input: ${inputStr}
Output: ${outputStr}

Respond ONLY with strict JSON:
{ "summary": "<one to two sentence plain-English explanation>", "notes": ["<short anomaly or next step>", "..."] }
Keep summary under 240 chars and at most 3 notes, each under 120 chars.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = body.content?.find((c) => c.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { summary?: string; notes?: string[] };
    if (typeof parsed.summary !== 'string') return null;
    return {
      summary: parsed.summary,
      notes: Array.isArray(parsed.notes) ? parsed.notes.slice(0, 3) : [],
      source: 'ai',
    };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const body = (req.body ?? {}) as {
    tool?: unknown;
    input?: unknown;
    output?: unknown;
  };
  if (typeof body.tool !== 'string' || !body.tool) {
    res.status(400).json({ error: 'tool required' });
    return;
  }

  const ai = await aiInsight(body.tool, body.input, body.output);
  if (ai) {
    res.setHeader('cache-control', 'no-store');
    res.status(200).json(ai);
    return;
  }
  res.status(200).json(fallback(body.tool));
}
