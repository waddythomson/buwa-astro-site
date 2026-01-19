# Buwa Astro Site

Local setup and editing guide for the Buwa Astro migration site.

## Quick Start

1) Install dependencies:

```sh
npm install
```

2) Start the dev server:

```sh
npm run dev
```

Astro will serve the site at `http://localhost:4322` by default. If that port
is blocked, use:

```sh
npm run dev -- --host 127.0.0.1 --port 4322
```

## Common Commands

- `npm run dev` — local development server with hot reload
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

## Editing Content

**Pages**
- Page content lives in `src/content/pages/*.md`.
- The home page uses `src/content/pages/home.md`.
- Most pages use frontmatter fields like `title`, `description`, `slug`, `ogImage`, `date`, and `modified`.

**Blog posts**
- Blog posts live in `src/content/posts/*.md`.

**Images**
- Add static images to `public/` or `public/uploads/` and reference them with `/uploads/...` paths.
- External images can be linked directly by URL.

## Routing Notes

- `src/pages/index.astro` renders the home page.
- `src/pages/[...slug].astro` renders other pages by `slug` from the page frontmatter.

## Need Help?

If the dev server fails to start, make sure you are on a modern Node.js version (18+).
