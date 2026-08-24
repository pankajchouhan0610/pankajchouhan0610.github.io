/** Convert a category or tag label into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function postUrl(id: string): string {
  return `/blog/${id}`;
}

export function categoryUrl(category: string): string {
  return `/category/${slugify(category)}`;
}

export function tagUrl(tag: string): string {
  return `/tags/${slugify(tag)}`;
}

function originOf(site: URL | string): string {
  return (typeof site === 'string' ? site : site.origin).replace(/\/$/, '');
}

/** Build an absolute URL for canonical, Open Graph, and JSON-LD values. */
export function absoluteUrl(path: string, site: URL | string): string {
  const normalized = path === '/' ? '/' : path.replace(/\/$/, '');
  return `${originOf(site)}${normalized === '/' ? '/' : normalized}`;
}

export function canonicalFromPath(pathname: string, site: URL | string): string {
  const origin = originOf(site);
  const normalized = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  return `${origin}${normalized}`;
}
