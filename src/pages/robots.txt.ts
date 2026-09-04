import type { APIRoute } from 'astro';
import { FALLBACK_SITE_URL } from '../consts';

/** Allow Google and other search crawlers; only block CMS/search internals. */
export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? FALLBACK_SITE_URL).replace(/\/$/, '');
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /search
Disallow: /search-index.json

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${origin}/sitemap.xml
Sitemap: ${origin}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
