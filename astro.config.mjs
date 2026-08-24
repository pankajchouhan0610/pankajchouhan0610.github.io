// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

const site = process.env.PUBLIC_SITE_URL || 'https://pankaj-bg4.pages.dev';

export default defineConfig({
  site,
  trailingSlash: 'never',
  compressHTML: true,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/search-index') &&
        !page.includes('/search') &&
        !page.includes('/api/'),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
