/**
 * Per-route head-only pre-rendering.
 *
 * After `vite build`, this script reads dist/index.html as a template and
 * writes a per-route copy at dist/<path>/index.html with the correct
 * <title>, <meta description>, <link canonical>, OG/Twitter tags, and
 * route-specific JSON-LD already in the HTML — so Googlebot, OG scrapers,
 * and slow connections see the real metadata on the first response.
 *
 * The body stays as the SPA shell (`<div id="root"></div>`). React still
 * boots and renders the page client-side. No hydration mismatch risk.
 *
 * Also (re)generates dist/sitemap.xml.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tools } from '../src/lib/tools';
import { posts } from '../src/blog';

const DIST = 'dist';
const SITE = 'https://debugdaily.online';
const TEMPLATE = readFileSync(join(DIST, 'index.html'), 'utf8');

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function replaceTag(html: string, regex: RegExp, replacement: string): string {
  if (regex.test(html)) return html.replace(regex, replacement);
  // If the tag doesn't exist, inject before </head>
  return html.replace('</head>', `  ${replacement}\n  </head>`);
}

function patch(html: string, meta: RouteMeta): string {
  const url = SITE + meta.path;
  const titleFull = meta.title.includes('debugdaily')
    ? meta.title
    : `${meta.title} — debugdaily`;
  const t = escAttr(titleFull);
  const d = escAttr(meta.description);

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(titleFull)}</title>`);
  out = replaceTag(out, /<meta\s+name="description"[^>]*>/, `<meta name="description" content="${d}" />`);
  out = replaceTag(out, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  out = replaceTag(out, /<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`);
  out = replaceTag(out, /<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`);
  out = replaceTag(out, /<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  out = replaceTag(out, /<meta\s+name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${t}" />`);
  out = replaceTag(out, /<meta\s+name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${d}" />`);

  if (meta.jsonLd) {
    const scriptTag = `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(meta.jsonLd)}</script>`;
    out = out.replace('</head>', `  ${scriptTag}\n  </head>`);
  }

  return out;
}

function writeRoute(routePath: string, html: string) {
  // '/' is dist/index.html (already exists, just rewrite)
  // '/foo/bar' → dist/foo/bar/index.html
  const rel = routePath === '/' ? 'index.html' : `${routePath.replace(/^\//, '')}/index.html`;
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// ─────────────────────────────  Build route list  ─────────────────────────────

const routes: RouteMeta[] = [];

// Home — keep the rich @graph from index.html template. We only patch route-level
// scalar tags; the existing <script type="application/ld+json"> in the template
// (WebSite + Organization + WebApplication) survives because patch() does not
// rewrite it.
routes.push({
  path: '/',
  title:
    'Free Developer Tools Online | debugdaily — JSON Formatter, JWT Decoder, IP Lookup & 78 More',
  description:
    'debugdaily.online is the free online toolkit for developers, DevOps engineers & sysadmins. JSON formatter, JWT decoder, cron builder, SSL checker, IP lookup and 78 tools. No login. No install. Always free.',
});

// Static pages
const STATIC_PAGES: RouteMeta[] = [
  {
    path: '/about',
    title: 'About debugdaily',
    description:
      'debugdaily is a free, browser-first toolkit of 78 developer and IT utilities with optional AI-powered Smart Context explanations.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description:
      'How debugdaily handles your data: what runs locally, what is sent to our server, and what third parties may set cookies.',
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description:
      'The terms under which debugdaily provides its free developer toolkit. Provided as-is, no warranty, fair use only.',
  },
  {
    path: '/contact',
    title: 'Contact',
    description:
      'Get in touch with the debugdaily team — feedback, bug reports, partnership and tool requests.',
  },
  {
    path: '/blog',
    title: 'Blog — debugdaily',
    description:
      'Practical engineering writing on DNS, JWT, password hashing, regex, and the rest of the daily debugging surface.',
  },
];
routes.push(...STATIC_PAGES);

// Tool pages
for (const tool of tools) {
  routes.push({
    path: `/tools/${tool.slug}`,
    title: tool.seo.title,
    description: tool.seo.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          name: tool.name,
          description: tool.seo.description,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any (browser)',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          url: `${SITE}/tools/${tool.slug}`,
        },
        breadcrumbs([
          { name: 'debugdaily', url: `${SITE}/` },
          { name: tool.name, url: `${SITE}/tools/${tool.slug}` },
        ]),
      ],
    },
  });
}

// Blog posts
for (const post of posts) {
  routes.push({
    path: `/blog/${post.slug}`,
    title: `${post.title} — debugdaily blog`,
    description: post.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.publishedAt,
          author: { '@type': 'Organization', name: 'debugdaily' },
          description: post.description,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/blog/${post.slug}`,
          },
          keywords: post.tags.join(', '),
        },
        breadcrumbs([
          { name: 'debugdaily', url: `${SITE}/` },
          { name: 'Blog', url: `${SITE}/blog` },
          { name: post.title, url: `${SITE}/blog/${post.slug}` },
        ]),
      ],
    },
  });
}

// ─────────────────────────────  Emit per-route HTML  ─────────────────────────────

let written = 0;
for (const route of routes) {
  const html = patch(TEMPLATE, route);
  writeRoute(route.path, html);
  written++;
}

// ─────────────────────────────  Regenerate sitemap.xml  ─────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const sitemapUrls = routes.map((r) => {
  const isHome = r.path === '/';
  const isBlog = r.path.startsWith('/blog');
  const isTool = r.path.startsWith('/tools/');
  const isStatic = !isTool && !isBlog && r.path !== '/';
  return {
    loc: SITE + r.path,
    changefreq: isHome ? 'weekly' : isTool ? 'monthly' : isBlog ? 'monthly' : 'yearly',
    priority: isHome ? '1.0' : isTool ? '0.8' : isBlog ? '0.7' : '0.3',
  };
});
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), xml);

// Also copy back into public/ so dev mode serves the same sitemap
if (existsSync('public')) {
  try {
    copyFileSync(join(DIST, 'sitemap.xml'), 'public/sitemap.xml');
  } catch {
    /* non-fatal */
  }
}

console.log(`prerender: wrote ${written} HTML files + sitemap.xml (${routes.length} URLs)`);
