# Theatre.js documentation site

Static documentation for the Theatre.js monorepo, built with [VitePress](https://vitepress.dev/).

## Why VitePress

We chose **VitePress** over Starlight (Astro) because the monorepo already uses Vite for the playground, VitePress keeps the docs toolchain small (Vue + Vite only), and it handles a mix of hand-written Markdown (future guides) plus large generated API trees without an extra framework layer. Starlight is excellent for content-heavy sites; for API-first docs with incremental human-written pages, VitePress is the lighter fit.

## API reference generation

Public API pages are **not** hand-written. They are produced from TypeScript via the same pipeline as package releases:

1. **api-extractor** — each package’s `build:api-json` script (see `theatre/package.json` and `packages/threejs/package.json`) emits a doc model to `/.temp/api/<package>.api.json` (configured in `devEnv/api-extractor-base.json`).
2. **api-documenter** — root devDependency `@microsoft/api-documenter` turns those JSON files into Markdown under `docs/api/` (public URL `/docs/api/`).

The `generate:api` script runs the necessary package builds, then api-documenter:

```bash
yarn workspace @unseenco/theatre-docs run generate:api
```

`docs/api/` is gitignored; CI and Netlify always regenerate it during `build`.

**Note:** `@unseenco/theatre-threejs/extension` is a separate entry point; only the package root is covered by api-extractor today. Extension API docs would need an additional api-extractor config.

## Local development

From the **repository root** (after `yarn`):

```bash
yarn docs:dev
```

Open the URL VitePress prints. With `base: '/docs/'`, the site is served under **`/docs/`** (e.g. `http://localhost:5173/docs/`).

Production build (docs only):

```bash
yarn docs:build
yarn workspace @unseenco/theatre-docs run preview   # optional; preview also uses /docs/
```

The first run compiles `theatre` and `@unseenco/theatre-threejs` declarations and may take a minute.

### Playground base path

The playground dev server (`yarn playground`) keeps Vite `base: '/'` so demos stay at paths like `/shared/dom/`. Production builds set `base: '/playground/'` so the same demos work on Netlify at `/playground/shared/dom/`.

## Unified site build (Netlify)

One Netlify site serves both docs and playground from the **`deploy/`** output:

```bash
yarn build:site
```

This runs VitePress into `deploy/docs/` and the playground MPA into `deploy/playground/`, plus a minimal `deploy/index.html` linking to both.

## Netlify deploy previews

Configuration lives in **`/netlify.toml`** at the repository root (not `docs/netlify.toml`).

| Setting | Value |
| --- | --- |
| Base directory | *(blank — repo root)* |
| Build command | *(from root `netlify.toml`)* |
| Publish directory | `deploy` *(from root `netlify.toml`)* |

The build runs `yarn build:site` after `yarn install`. Deploy previews rebuild on every push to the PR branch (`[context.deploy-preview] ignore = "false"`).

Example paths on a deploy preview:

- `/` — landing links
- `/docs/` — API documentation
- `/playground/` — playground home
- `/playground/shared/dom/` — DOM demo
