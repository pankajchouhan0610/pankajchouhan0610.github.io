# Pankaj

Personal technology blog by Pankaj Chauhan covering software engineering, system design, distributed systems, databases, backend engineering, and AI.

Posts live in Git as Markdown. There is no application database. GitHub is the source of truth. Cloudflare Pages hosts the public site (free) and runs `/api/auth` for the CMS.

## Local development

Prerequisites: Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321`.

Useful commands:

```bash
npm run build      # production build to ./dist
npm run preview    # serve the production build
npx astro check    # TypeScript and Astro diagnostics
```

Copy `.env.example` to `.env` if you want a local site URL:

```bash
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_GITHUB_REPO=YOUR_GITHUB_USER/YOUR_REPO
PUBLIC_GITHUB_BRANCH=main
```

## Project layout

```text
src/
  content/blog/          Markdown posts (source of truth)
  content.config.ts      Zod schema for frontmatter
  components/            UI building blocks
  layouts/               Shared page shells
  pages/                 Routes
  lib/                   Posts, dates, SEO helpers
public/
  admin/                 Decap CMS app shell
  images/blog/           Local article images
functions/api/auth.js    GitHub OAuth proxy (optional Cloudflare Pages)
```

## Creating a blog post

### In the repository

Add a file under `src/content/blog/`:

```md
---
title: "How Redis Distributed Locks Work"
description: "A practical explanation of Redis distributed locking."
pubDate: 2026-08-24
updatedDate: 2026-08-24
author: "Pankaj Chauhan"
category: "System Design"
tags:
  - Redis
  - Distributed Systems
heroImage: "/images/blog/redis-lock.svg"
heroImageAlt: "Lock illustration over a key grid"
draft: false
featured: false
trending: false
---

Article body in Markdown.
```

The filename becomes the slug: `how-redis-distributed-locks-work.md` → `/blog/how-redis-distributed-locks-work`.

### In Decap CMS

1. Open `/admin`.
2. Create a Blog entry.
3. Fill title, description, dates, category, tags, and body.
4. Set **Draft** to true to keep it out of production builds.
5. Save. Decap commits the Markdown file to GitHub.

Homepage feeds:

- **Popular** uses `featured: true`
- **Trending** uses `trending: true`
- **Latest** is every published post by `pubDate`

## How drafts work

`draft: true` posts are hidden from production listings, sitemaps, and RSS. They remain visible in `npm run dev` so you can preview them locally.

Uncheck Draft in the CMS (or set `draft: false` in frontmatter) to publish on the next GitHub Pages build.

## Images

Store article images in `public/images/blog/` and reference them as `/images/blog/your-file.svg`.

Decap uploads land in that folder. Prefer SVG or compressed PNG/WebP. Always set `heroImageAlt`.

Open Graph tags currently fall back to `/images/og-default.svg`. Replace that file with a 1200×630 PNG named `/images/og-default.png` for the most reliable social previews, then update the fallback in `src/components/Seo.astro` if needed.

## SEO

Every page emits:

- Unique `<title>` and meta description
- Canonical URL
- Open Graph and Twitter card tags
- `robots` directives
- JSON-LD (`WebSite`, `Blog`, `BlogPosting`, `BreadcrumbList`, `CollectionPage`)
- Article published/modified times on post pages

Generated files:

- `/sitemap-index.xml` from `@astrojs/sitemap`
- `/robots.txt`
- `/rss.xml`

Every published post automatically gets:

- Unique title and meta description from frontmatter
- Canonical URL
- Open Graph + Twitter cards
- `BlogPosting` JSON-LD with author, dates, tags, and category
- Inclusion in the sitemap and RSS feed when `draft: false`

To appear in Google Search:

1. Keep `draft: false` on posts you want indexed
2. Write a clear `description` (about 120–160 characters)
3. Use a real `title`, meaningful headings (`##`), and alt text on images
4. Submit `https://pankaj-bg4.pages.dev/sitemap-index.xml` in [Google Search Console](https://search.google.com/search-console)

Set `PUBLIC_SITE_URL` to your canonical origin before building so canonical tags, sitemap, and CMS OAuth use the correct domain.

## Hosting (Cloudflare Pages — recommended, free)

**Primary host:** Cloudflare Pages (supports live `/admin` + GitHub OAuth).

Follow the full checklist in [CLOUDFLARE.md](./CLOUDFLARE.md).

Expected live URL after setup:

- https://pankaj-bg4.pages.dev

Repository (source of truth):

- https://github.com/pankajchouhan0610/pankajchouhan0610.github.io

## GitHub Pages (backup mirror)

GitHub Pages still deploys from `main` to https://pankajchouhan0610.github.io, but **`/api/auth` does not work there**. Use the Cloudflare URL for the CMS.

## Admin security

`/admin` asks for a **password**, then Decap asks you to **Login with GitHub** (on Cloudflare).

- Password: blocks casual visitors
- GitHub OAuth: lets only you commit posts to the repo

Locally, use `npm run dev` + `npx decap-server`. You can also edit Markdown under `src/content/blog/` on GitHub.

## Decap CMS (local)

```bash
npx decap-server
```

Keep `npm run dev` running. In development, `/admin/config.yml` enables `local_backend`, so the CMS writes to your working tree.

## Custom domain

1. Cloudflare Pages project → **Custom domains** → add your domain
2. Update the GitHub OAuth App homepage + callback to `https://your-domain/api/auth`
3. Set `PUBLIC_SITE_URL=https://your-domain` in Cloudflare and redeploy


## Analytics

Analytics are not included. The placeholder is `src/lib/analytics.ts`. Add a provider there later if you need one.

## License

Personal project. Sample articles are provided for the publication itself.
