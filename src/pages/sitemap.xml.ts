import type { APIRoute } from 'astro';
import { FALLBACK_SITE_URL } from '../consts';
import {
  getPublishedPosts,
  uniqueCategories,
  uniqueTags,
} from '../lib/posts';
import { canonicalFromPath, categoryUrl, postUrl, tagUrl } from '../lib/urls';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, lastmod?: Date, changefreq?: string, priority?: string): string {
  const parts = [`<loc>${escapeXml(loc)}</loc>`];
  if (lastmod) {
    parts.push(`<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`);
  }
  if (changefreq) {
    parts.push(`<changefreq>${changefreq}</changefreq>`);
  }
  if (priority) {
    parts.push(`<priority>${priority}</priority>`);
  }
  return `<url>${parts.join('')}</url>`;
}

/** Conventional /sitemap.xml for Google Search Console and crawlers. */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL(FALLBACK_SITE_URL);
  const posts = await getPublishedPosts();
  const latestPostDate = posts[0]?.data.pubDate;

  const staticPages: Array<{ path: string; changefreq: string; priority: string }> = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/about', changefreq: 'monthly', priority: '0.6' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' },
    { path: '/latest', changefreq: 'daily', priority: '0.8' },
    { path: '/trending', changefreq: 'daily', priority: '0.8' },
    { path: '/tags', changefreq: 'weekly', priority: '0.5' },
  ];

  const entries: string[] = [
    ...staticPages.map((page) =>
      urlEntry(canonicalFromPath(page.path, origin), latestPostDate, page.changefreq, page.priority),
    ),
    ...posts.map((post) =>
      urlEntry(canonicalFromPath(postUrl(post.id), origin), post.data.pubDate, 'weekly', '0.8'),
    ),
    ...uniqueCategories(posts).map((category) =>
      urlEntry(canonicalFromPath(categoryUrl(category), origin), latestPostDate, 'weekly', '0.6'),
    ),
    ...uniqueTags(posts).map((tag) =>
      urlEntry(canonicalFromPath(tagUrl(tag), origin), latestPostDate, 'weekly', '0.5'),
    ),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
