import { invoke, isTauri } from './runtime';

export interface SslInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  altNames: string[];
  protocol?: string;
}

export async function sslCheck(host: string): Promise<SslInfo> {
  if (isTauri) {
    return invoke<SslInfo>('ssl_check', { host });
  }
  const res = await fetch(`/api/ssl?host=${encodeURIComponent(host)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as SslInfo;
}
