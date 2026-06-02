import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTimeMin: number;
  tags: string[];
  Component: LazyExoticComponent<ComponentType>;
}

export const posts: PostMeta[] = [
  {
    slug: 'regex-catastrophic-backtracking',
    title: 'Regex catastrophic backtracking: how to spot it before production does',
    description:
      'A regex that takes 5ms on short input and 30 seconds on slightly longer input is not slow — it is exponential. Here is how to recognize the pattern, why it happens, and three reliable fixes.',
    publishedAt: '2026-05-30',
    readingTimeMin: 9,
    tags: ['regex', 'performance', 'security', 'redos'],
    Component: lazy(() => import('./posts/regex-catastrophic-backtracking')),
  },
  {
    slug: 'uuid-v4-vs-v7-2026',
    title: 'UUIDv4 or UUIDv7 in 2026: which one belongs in your primary key',
    description:
      'v4 has been the reflexive answer for twenty years. v7 is now standardized and fixes the one real problem v4 has as a clustered-index primary key. Here is when each one is right.',
    publishedAt: '2026-05-20',
    readingTimeMin: 10,
    tags: ['uuid', 'ulid', 'database', 'identifiers'],
    Component: lazy(() => import('./posts/uuid-v4-vs-v7-2026')),
  },
  {
    slug: 'base64-vs-base64url',
    title: 'Base64 vs base64url: the two-character difference that breaks every JWT debug session',
    description:
      'Base64 and base64url share an alphabet, an expansion ratio, and a name. They are also incompatible. Here is the two-character difference, where each one shows up, and the bugs that come from confusing them.',
    publishedAt: '2026-05-10',
    readingTimeMin: 8,
    tags: ['base64', 'encoding', 'jwt', 'oauth'],
    Component: lazy(() => import('./posts/base64-vs-base64url')),
  },
  {
    slug: 'spf-dkim-dmarc-debug',
    title: 'SPF, DKIM, DMARC: a practical email-debugging guide',
    description:
      'When transactional email lands in spam, the cause is almost always one of three TXT records. Here\'s what each one does, how they fail, and the order to debug them in.',
    publishedAt: '2026-05-02',
    readingTimeMin: 9,
    tags: ['email', 'spf', 'dkim', 'dmarc', 'deliverability'],
    Component: lazy(() => import('./posts/spf-dkim-dmarc-debug')),
  },
  {
    slug: 'cron-expressions-explained',
    title: 'Cron expressions, finally explained: Unix, Quartz, AWS',
    description:
      'The five fields, the four symbols, and the dialect differences between Unix cron, Quartz, and AWS EventBridge — including the day-of-month/day-of-week trap that bites everyone.',
    publishedAt: '2026-05-01',
    readingTimeMin: 8,
    tags: ['cron', 'scheduling', 'aws', 'quartz'],
    Component: lazy(() => import('./posts/cron-expressions-explained')),
  },
  {
    slug: 'how-dns-records-work',
    title: 'How DNS records actually work: A, AAAA, MX, TXT explained',
    description:
      'A practical, no-fluff explainer of the DNS record types you actually use — what each one is for, when to reach for it, and the gotchas that bite people in production.',
    publishedAt: '2026-04-30',
    readingTimeMin: 8,
    tags: ['dns', 'networking', 'fundamentals'],
    Component: lazy(() => import('./posts/how-dns-records-work')),
  },
  {
    slug: 'jwt-decoded-vs-verified',
    title: 'JWT decoded is not JWT verified — and why that distinction matters',
    description:
      'Decoding a JWT is just base64. Verifying it actually checks the signature. Confusing the two is how every JWT auth bug starts. Here\'s the difference, in code.',
    publishedAt: '2026-04-29',
    readingTimeMin: 7,
    tags: ['jwt', 'auth', 'security'],
    Component: lazy(() => import('./posts/jwt-decoded-vs-verified')),
  },
  {
    slug: 'bcrypt-cost-factor-2026',
    title: 'Bcrypt cost factor in 2026: why 10 isn\'t enough anymore',
    description:
      'Picking a bcrypt cost factor is supposed to be easy. Six years ago, "10" was fine. Now it isn\'t. Here\'s how to pick one for 2026 hardware — and verify it.',
    publishedAt: '2026-04-28',
    readingTimeMin: 6,
    tags: ['bcrypt', 'passwords', 'security', 'hashing'],
    Component: lazy(() => import('./posts/bcrypt-cost-factor-2026')),
  },
];

export const postBySlug: Record<string, PostMeta> = Object.fromEntries(
  posts.map((p) => [p.slug, p]),
);

/**
 * Find blog posts relevant to a given set of keywords. Used by tool pages to
 * suggest deeper reading (e.g., DNS Lookup → "How DNS records work").
 * Returns at most `limit` posts, sorted by relevance.
 */
export function relatedPosts(keywords: string[], limit = 3): PostMeta[] {
  const lowerKeywords = new Set(keywords.map((k) => k.toLowerCase()));
  return posts
    .map((post) => {
      let score = 0;
      const hay = (post.title + ' ' + post.description + ' ' + post.tags.join(' ')).toLowerCase();
      for (const kw of lowerKeywords) {
        if (post.tags.some((t) => t.toLowerCase() === kw)) score += 5;
        else if (hay.includes(kw)) score += 1;
      }
      return { post, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

export function relatedPostsByTags(tags: string[], excludeSlug?: string, limit = 3): PostMeta[] {
  return posts
    .filter((p) => p.slug !== excludeSlug)
    .map((post) => {
      const overlap = post.tags.filter((t) => tags.includes(t)).length;
      return { post, score: overlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
