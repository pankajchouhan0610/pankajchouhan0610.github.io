import rss from '@astrojs/rss';
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME } from '../consts';
import { getPublishedPosts } from '../lib/posts';
import { postUrl } from '../lib/urls';

export async function GET(context: { site?: URL }) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-us</language><copyright>© ${new Date().getFullYear()} ${AUTHOR_NAME}</copyright>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: post.data.author,
      categories: [post.data.category, ...post.data.tags],
      link: postUrl(post.id),
    })),
  });
}
