# Theatre.js documentation site

Static documentation for the Theatre.js monorepo, built with [VitePress](https://vitepress.dev/).

## Why VitePress

We chose **VitePress** over Starlight (Astro) because the monorepo already uses Vite for the playground, VitePress keeps the docs toolchain small (Vue + Vite only), and it handles a mix of hand-written Markdown (future guides) plus large generated API trees without an extra framework layer. Starlight is excellent for content-heavy sites; for API-first docs with incremental human-written pages, VitePress is the lighter fit.

## API reference generation

Public API pages are **not** hand-written. They are produced from TypeScript via the same pipeline as package releases:

1. **api-extractor** — each package’s `build:api-json` script (see `theatre/package.json` and `packages/threejs/package.json`) emits a doc model to `/.temp/api/<package>.api.json` (configured in `devEnv/api-extractor-base.json`).
2. **api-documenter** — root devDependency `@microsoft/api-documenter` turns those JSON files into Markdown under `docs/generated/api-reference/`.

The `generate:api` script runs the necessary package builds, then api-documenter:

```bash
yarn workspace @unseenco/theatre-docs run generate:api
```

`generated/` is gitignored; CI and Netlify always regenerate it during `build`.

**Note:** `@unseenco/theatre-threejs/extension` is a separate entry point; only the package root is covered by api-extractor today. Extension API docs would need an additional api-extractor config.

## Local development

From the **repository root** (after `yarn`):

```bash
yarn docs:dev
```

Open the URL VitePress prints (typically `http://localhost:5173`).

Production build:

```bash
yarn docs:build
yarn workspace @unseenco/theatre-docs run preview   # optional
```

The first run compiles `theatre` and `@unseenco/theatre-threejs` declarations and may take a minute.

## Netlify deploy previews

Use a **separate** Netlify site from the playground (`/netlify.toml` at repo root).

| Setting | Value |
| --- | --- |
| Base directory | `docs` |
| Build command | (from `docs/netlify.toml`) |
| Publish directory | `.vitepress/dist` (relative to base) |

Deploy previews run `yarn install` at the monorepo root, then `yarn workspace @unseenco/theatre-docs run build`, which regenerates API Markdown and runs `vitepress build`.
