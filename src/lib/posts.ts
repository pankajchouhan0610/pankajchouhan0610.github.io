import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from './urls';

export type BlogPost = CollectionEntry<'blog'>;

/** Published posts only in production; drafts remain visible during local development. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Featured posts power the Popular tab; fall back to latest if none are marked. */
export function getPopularPosts(posts: BlogPost[]): BlogPost[] {
  const featured = posts.filter((post) => post.data.featured);
  return featured.length > 0 ? featured : posts.slice(0, 5);
}

/** Trending tab uses the trending flag, with the same latest-post fallback. */
export function getTrendingPosts(posts: BlogPost[]): BlogPost[] {
  const trending = posts.filter((post) => post.data.trending);
  return trending.length > 0 ? trending : posts.slice(0, 5);
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
  };
}

export function postsByCategory(posts: BlogPost[], categorySlug: string): BlogPost[] {
  return posts.filter((post) => slugify(post.data.category) === categorySlug);
}

export function postsByTag(posts: BlogPost[], tagSlug: string): BlogPost[] {
  return posts.filter((post) => post.data.tags.some((tag) => slugify(tag) === tagSlug));
}

export function uniqueCategories(posts: BlogPost[]): string[] {
  return [...new Set(posts.map((post) => post.data.category))].sort((a, b) => a.localeCompare(b));
}

export function uniqueTags(posts: BlogPost[]): string[] {
  return [...new Set(posts.flatMap((post) => post.data.tags))].sort((a, b) => a.localeCompare(b));
}

/** Score related posts by shared category first, then overlapping tags. */
export function relatedPosts(post: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const scored = posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const sameCategory = candidate.data.category === post.data.category ? 3 : 0;
      const sharedTags = candidate.data.tags.filter((tag) => post.data.tags.includes(tag)).length;
      return { candidate, score: sameCategory + sharedTags };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.data.pubDate.valueOf() - a.candidate.data.pubDate.valueOf());

  return scored.slice(0, limit).map((entry) => entry.candidate);
}

export function adjacentPosts(post: BlogPost, posts: BlogPost[]) {
  const index = posts.findIndex((entry) => entry.id === post.id);
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export function findCategoryLabel(posts: BlogPost[], categorySlug: string): string | undefined {
  return posts.find((post) => slugify(post.data.category) === categorySlug)?.data.category;
}

export function findTagLabel(posts: BlogPost[], tagSlug: string): string | undefined {
  return posts.flatMap((post) => post.data.tags).find((tag) => slugify(tag) === tagSlug);
}
