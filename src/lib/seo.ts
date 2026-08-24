import {
  AUTHOR_IMAGE,
  AUTHOR_LINKEDIN,
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from '../consts';
import { absoluteUrl } from './urls';

type JsonLd = Record<string, unknown>;

export function personJsonLd(site: string): JsonLd {
  return {
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: absoluteUrl('/about', site),
    image: absoluteUrl(AUTHOR_IMAGE, site),
    jobTitle: 'Software Engineer',
    sameAs: [AUTHOR_LINKEDIN],
  };
}

export function websiteJsonLd(site: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl('/', site),
    inLanguage: 'en',
    publisher: personJsonLd(site),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/search', site)}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function blogJsonLd(site: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_NAME,
    description: SITE_TAGLINE,
    url: absoluteUrl('/', site),
    inLanguage: 'en',
    author: personJsonLd(site),
  };
}

export function breadcrumbJsonLd(
  site: string,
  items: { name: string; path: string }[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site),
    })),
  };
}

export function articleJsonLd(options: {
  site: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  pubDate: Date;
  updatedDate?: Date;
  author: string;
  category: string;
  tags: string[];
}): JsonLd {
  const { site, url, title, description, image, pubDate, updatedDate, author, category, tags } =
    options;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    author: {
      '@type': 'Person',
      name: author,
      url: absoluteUrl('/about', site),
      image: absoluteUrl(AUTHOR_IMAGE, site),
      sameAs: [AUTHOR_LINKEDIN],
    },
    publisher: {
      ...personJsonLd(site),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/apple-touch-icon.png', site),
      },
    },
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category,
    keywords: tags.join(', '),
    inLanguage: 'en',
    url,
  };
}

export function collectionJsonLd(
  site: string,
  name: string,
  description: string,
  url: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: absoluteUrl('/', site),
    },
  };
}
