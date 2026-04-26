import { invoke, isTauri } from './runtime';

export interface DnsRecord {
  value: string;
  priority?: number;
  ttl?: number;
}

export interface DnsAnswer {
  type: string;
  records: DnsRecord[];
}

export async function dnsLookup(host: string, type: string): Promise<DnsAnswer> {
  if (isTauri) {
    return invoke<DnsAnswer>('dns_lookup', { host, type });
  }
  const res = await fetch(
    `/api/dns?host=${encodeURIComponent(host)}&type=${encodeURIComponent(type)}`,
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as DnsAnswer;
}
