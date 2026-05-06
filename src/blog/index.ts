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
