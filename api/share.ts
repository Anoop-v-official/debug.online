import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

interface Stored {
  tool: string;
  state: unknown;
  createdAt: number;
}

const memory = new Map<string, Stored>();
const MEMORY_TTL_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 64 * 1024;

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

function genId(): string {
  return crypto.randomBytes(8).toString('base64url');
}

async function kvSet(id: string, value: Stored): Promise<void> {
  if (!KV_URL || !KV_TOKEN) return;
  const res = await fetch(`${KV_URL}/set/share:${id}?ex=2592000`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${KV_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status}`);
}

async function kvGet(id: string): Promise<Stored | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  const res = await fetch(`${KV_URL}/get/share:${id}`, {
    headers: { authorization: `Bearer ${KV_TOKEN}` },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { result?: string | null };
  if (!body.result) return null;
  try {
    return JSON.parse(body.result) as Stored;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const raw = JSON.stringify(req.body ?? {});
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
      res.status(413).json({ error: 'state too large' });
      return;
    }
    const body = (req.body ?? {}) as { tool?: unknown; state?: unknown };
    if (typeof body.tool !== 'string' || !body.tool) {
      res.status(400).json({ error: 'tool required' });
      return;
    }
    const id = genId();
    const stored: Stored = { tool: body.tool, state: body.state, createdAt: Date.now() };
    try {
      await kvSet(id, stored);
    } catch (e) {
      res.status(502).json({ error: e instanceof Error ? e.message : 'kv error' });
      return;
    }
    if (!KV_URL || !KV_TOKEN) memory.set(id, stored);
    res.status(200).json({ id });
    return;
  }

  if (req.method === 'GET') {
    const id = String(req.query.id ?? '');
    if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }
    let value = await kvGet(id);
    if (!value) {
      const m = memory.get(id);
      if (m && Date.now() - m.createdAt < MEMORY_TTL_MS) value = m;
      else if (m) memory.delete(id);
    }
    if (!value) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.status(200).json(value);
    return;
  }

  res.status(405).json({ error: 'POST or GET only' });
}
