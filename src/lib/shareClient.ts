import { api } from './apiBase';

interface StoredShare {
  tool: string;
  state: unknown;
  createdAt?: number;
}

/**
 * POST current tool state to /api/share. Returns the share ID on success.
 */
export async function createShare(tool: string, state: unknown): Promise<string> {
  const res = await fetch(api('/api/share'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tool, state }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `share failed (HTTP ${res.status})`);
  }
  const json = (await res.json()) as { id: string };
  return json.id;
}

/**
 * GET a previously stored share by id. Returns null if not found / invalid /
 * for a different tool.
 */
export async function loadShare(id: string, expectedTool: string): Promise<unknown | null> {
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null;
  try {
    const res = await fetch(api(`/api/share?id=${encodeURIComponent(id)}`));
    if (!res.ok) return null;
    const body = (await res.json()) as StoredShare;
    if (body.tool !== expectedTool) return null;
    return body.state;
  } catch {
    return null;
  }
}
