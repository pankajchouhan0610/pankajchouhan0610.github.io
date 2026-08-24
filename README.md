# Pankaj

Personal technology blog by Pankaj Chauhan covering software engineering, system design, distributed systems, databases, backend engineering, and AI.

Posts live in Git as Markdown. There is no application database. GitHub is the source of truth. GitHub Pages hosts the public site. The `/admin` editor works locally and is locked on the live site.

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

Set `PUBLIC_SITE_URL` to your canonical origin before building so canonical tags, sitemap, and CMS OAuth use the correct domain.

## GitHub hosting (free)

Yes, GitHub works. The repository is the source of truth, and GitHub Pages serves the static site for free.

Live site after deploy:

- https://pankajchouhan0610.github.io

Repository:

- https://github.com/pankajchouhan0610/pankajchouhan0610.github.io

Every push to `main` runs `.github/workflows/deploy-github-pages.yml`, builds Astro, and publishes Pages.

The repo must stay **public** for free GitHub Pages on a personal account.

## Admin security

`/admin` asks for a **password only**. The editor does not load until the password is correct.

GitHub Pages is static, so the page checks a hash of the password in the browser. The plaintext password is not stored in the repository. This blocks casual visitors; it is not as strong as server-side auth.

After unlock, Decap may still need GitHub permission to save posts on the live site. Locally, use `npm run dev` + `npx decap-server`. You can also edit Markdown under `src/content/blog/` on GitHub.

## Decap CMS (local)

```bash
npx decap-server
```

Keep `npm run dev` running. In development, `/admin/config.yml` enables `local_backend`, so the CMS writes to your working tree.

## Cloudflare Pages (optional)

Cloudflare Pages is also free and can sit on the same GitHub repo if you want a custom domain plus optional production CMS OAuth.

1. Import the GitHub repository in Cloudflare Pages.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Node version: `22`
5. Set `PUBLIC_SITE_URL` to the Cloudflare URL or custom domain.

## Custom domain

### GitHub Pages

1. Repo → Settings → Pages → Custom domain
2. Add a `CNAME` DNS record to `pankajchouhan0610.github.io`
3. Set `PUBLIC_SITE_URL=https://your-domain` in the GitHub Actions env and rebuild

### Cloudflare Pages

1. Open the Pages project → Custom domains
2. Add the domain
3. Set `PUBLIC_SITE_URL` and rebuild


## Analytics

Analytics are not included. The placeholder is `src/lib/analytics.ts`. Add a provider there later if you need one.

## License

Personal project. Sample articles are provided for the publication itself.
