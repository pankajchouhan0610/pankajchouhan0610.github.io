import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { postUrl } from '../lib/urls';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const payload = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    url: postUrl(post.id),
  }));

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
