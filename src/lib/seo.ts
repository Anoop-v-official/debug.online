import { useEffect } from 'react';

const SITE_NAME = 'debugdaily';
const SITE_URL = 'https://debugdaily.online';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.png`;

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(selector: string, attr: string, value: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, name] = selector.match(/\[(\w+)="([^"]+)"\]/) ?? [];
    if (selector.includes('property=')) {
      const m = selector.match(/property="([^"]+)"/);
      if (m) el.setAttribute('property', m[1]);
    } else {
      const m = selector.match(/name="([^"]+)"/);
      if (m) el.setAttribute('name', m[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ID = 'debugonline-jsonld';

function setJsonLd(data: Record<string, unknown> | null): void {
  let el = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function useSeo({ title, description, path = '/', image, jsonLd }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    const url = SITE_URL + path;
    const imageUrl = image ?? DEFAULT_OG_IMAGE;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:image"]', 'content', imageUrl);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', imageUrl);
    setLink('canonical', url);
    setJsonLd(jsonLd ?? null);
    return () => setJsonLd(null);
  }, [title, description, path, image, jsonLd]);
}
