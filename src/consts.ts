/** Site-wide identity used for SEO, RSS, CMS, and UI. */
export const SITE_NAME = 'techlist';
export const SITE_TAGLINE = 'Engineering notes on systems, software, and infrastructure.';
export const SITE_DESCRIPTION =
  'A personal technology publication covering software engineering, system design, distributed systems, databases, backend engineering, and AI.';

export const AUTHOR_NAME = 'Pankaj Chauhan';
export const AUTHOR_ROLE = 'Software Engineer';
export const AUTHOR_BIO =
  'I write about building reliable software: distributed systems, databases, backend engineering, and the trade-offs behind production architecture.';

/** Fallback origin when PUBLIC_SITE_URL is not set at build time. */
export const FALLBACK_SITE_URL = 'https://pankajchouhan0610.github.io';

export const PAGE_SIZE = 10;
export const WORDS_PER_MINUTE = 220;

export const NAV_FEEDS = [
  { href: '/', label: 'Popular' },
  { href: '/trending', label: 'Trending' },
  { href: '/latest', label: 'Latest' },
] as const;
