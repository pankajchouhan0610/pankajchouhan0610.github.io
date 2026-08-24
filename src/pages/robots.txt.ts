import type { APIRoute } from 'astro';
import { FALLBACK_SITE_URL } from '../consts';

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? FALLBACK_SITE_URL).replace(/\/$/, '');
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /search-index.json

Sitemap: ${origin}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
