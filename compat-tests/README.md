# Compatibility tests

This setup tests whether published `@unseenco/backstage-*` packages install and build in a minimal consumer project (outside Yarn workspace resolution).

## Fixtures

- **`vite-react18/`** — Vite + React 18 + `@unseenco/backstage` and `@unseenco/backstage/studio` installed from a local Verdaccio registry (primary fixture for 1.0).
- **`vite-backstage-full-stack/`** — Vite + `@unseenco/backstage`, `@unseenco/backstage/studio`, `@unseenco/backstage/threejs` (including `@unseenco/backstage/threejs/extension`), `@unseenco/backstage/gsap`, `three`, and `gsap`. Runs production `vite build` and a dependency pre-bundle check (same failure mode as `vite dev` / missing `package.json` `exports`).

Each fixture has:

- `package/` — standalone npm package (not a workspace member).
- `*.compat-test.ts` — Jest tests (e.g. production `vite build`).

## How to run

1. `yarn test:compat:install` — builds packages, starts Verdaccio, publishes all published `@unseenco/*` packages (including **threejs**), runs `npm install` in each `fixtures/*/package`.
2. `yarn test:compat:run` — runs `*.compat-test.ts` under `compat-tests/fixtures/`.

If install fails, check unsatisfiable `dependency` / `peerDependency` on `@unseenco/backstage-*` first.

> **Gotcha:** Some bundlers walk `node_modules` into the monorepo. Fixtures are designed to run as isolated installs; if a setup fails only inside the monorepo, try the same `package/` tree outside the repo.
