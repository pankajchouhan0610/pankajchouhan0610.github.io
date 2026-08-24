import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site?.href ?? 'http://localhost:4321').replace(/\/$/, '');
  const repo = import.meta.env.PUBLIC_GITHUB_REPO || 'pankajchouhan0610/pankajchouhan0610.github.io';
  const branch = import.meta.env.PUBLIC_GITHUB_BRANCH || 'main';
  const localBackend = import.meta.env.DEV;

  const body = `backend:
  name: github
  repo: ${repo}
  branch: ${branch}
  base_url: ${siteUrl}
  auth_endpoint: api/auth
  commit_messages:
    create: Create {{collection}} “{{slug}}”
    update: Update {{collection}} “{{slug}}”
    delete: Delete {{collection}} “{{slug}}”
    uploadMedia: Upload “{{path}}”
    deleteMedia: Delete “{{path}}”

local_backend: ${localBackend}

media_folder: public/images/blog
public_folder: /images/blog

slug:
  encoding: ascii
  clean_accents: true
  sanitize_replacement: "-"

collections:
  - name: blog
    label: Blog
    folder: src/content/blog
    create: true
    delete: true
    slug: "{{slug}}"
    extension: md
    format: frontmatter
    preview_path: blog/{{slug}}
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Description, name: description, widget: text }
      - { label: Publish Date, name: pubDate, widget: datetime, date_format: YYYY-MM-DD, time_format: false }
      - { label: Updated Date, name: updatedDate, widget: datetime, date_format: YYYY-MM-DD, time_format: false, required: false }
      - { label: Author, name: author, widget: string, default: "Pankaj Chauhan" }
      - label: Category
        name: category
        widget: select
        options:
          - Software Engineering
          - System Design
          - Distributed Systems
          - AI
          - Backend Engineering
          - Databases
          - Cloud
          - Programming
          - Developer Tools
      - { label: Tags, name: tags, widget: list, allow_add: true }
      - { label: Hero Image, name: heroImage, widget: image, required: false }
      - { label: Hero Image Alt Text, name: heroImageAlt, widget: string, required: false }
      - { label: Draft, name: draft, widget: boolean, default: true }
      - { label: Featured, name: featured, widget: boolean, default: false, hint: "Shown on the Popular feed" }
      - { label: Trending, name: trending, widget: boolean, default: false, hint: "Shown on the Trending feed" }
      - { label: Body, name: body, widget: markdown }
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
