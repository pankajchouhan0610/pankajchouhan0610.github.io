# Cloudflare Pages — free hosting for this blog

This project is set up for **Cloudflare Pages** so `/admin` can use GitHub login.

GitHub stays the source of truth for Markdown. Cloudflare only builds and hosts the site.

**Live site (already deployed):** https://pankajchouhan.dev  
**Cloudflare URL:** https://pankaj-bg4.pages.dev

## 1. Create / update a GitHub OAuth App (required for live CMS)

1. Open [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Edit your CMS OAuth App (or create one)
3. Set:
   - **Application name:** `Pankaj Blog CMS`
   - **Homepage URL:** `https://pankajchouhan.dev`
   - **Authorization callback URL (Redirect URI):** `https://pankajchouhan.dev/api/auth`
4. Also add this Redirect URI if you still use the pages.dev host:
   - `https://pankaj-bg4.pages.dev/api/auth`
5. Save / Update application
6. Copy **Client ID** and **Client secret**

Do not commit these values.

**Important:** The callback must be `/api/auth`, not `/admin`.

## 2. Add secrets in Cloudflare (existing project: `pankaj`)

1. Open [Cloudflare Dashboard → Workers & Pages → pankaj](https://dash.cloudflare.com/?to=/:account/pages/view/pankaj)
2. **Settings** → **Environment variables**
3. Add for **Production** (and Preview if you want):

| Name | Value | Secret? |
|---|---|---|
| `PUBLIC_SITE_URL` | `https://pankajchouhan.dev` | No |
| `PUBLIC_GITHUB_REPO` | `pankajchouhan0610/pankajchouhan0610.github.io` | No |
| `PUBLIC_GITHUB_BRANCH` | `main` | No |
| `GITHUB_CLIENT_ID` | *(from OAuth App)* | Yes |
| `GITHUB_CLIENT_SECRET` | *(from OAuth App)* | Yes |
| `NODE_VERSION` | `22` | No |

4. Redeploy (Deployments → Retry deployment, or push to `main` after Git is connected)

Or from a terminal (you will be prompted to paste each secret):

```bash
npx wrangler pages secret put GITHUB_CLIENT_ID --project-name=pankaj
npx wrangler pages secret put GITHUB_CLIENT_SECRET --project-name=pankaj
```

## 3. Optional: auto-deploy from GitHub

1. Cloudflare Pages project `pankaj` → **Settings** → **Builds & deployments**
2. Connect Git provider → select `pankajchouhan0610/pankajchouhan0610.github.io`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Every push to `main` will rebuild

Until Git is connected, deploy manually with:

```bash
npm run pages:deploy
```

## 4. Use the CMS

1. Open https://pankajchouhan.dev/admin
2. Enter the site password
3. Click **Login with GitHub** and authorize
4. Create/edit posts — Decap commits Markdown to GitHub
5. Cloudflare rebuilds (after Git is connected)

## 5. Custom domain (optional)

1. Pages project → **Custom domains** → add your domain
2. Update the OAuth App homepage + callback to `https://your-domain/api/auth`
3. Set `PUBLIC_SITE_URL=https://your-domain` and redeploy

## Local CMS

```bash
npm run dev
npx decap-server
```

Then open http://localhost:4321/admin
