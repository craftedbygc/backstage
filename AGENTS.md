# AGENTS.md

Concise agent-facing notes for the Theatre.js monorepo. Read `CONTRIBUTING.md` for the human-facing version.

## Toolchain

- **Yarn 3.2** (via `.yarnrc.yml`, `nodeLinker: node-modules`) pinned through `packageManager`. `npm install` won't work — use `yarn`. One install step: `yarn`. TypeScript pinned to `5.3.3` (do not bump casually — multi-project solution build depends on it).
- Node **22** in CI and Netlify; Node 18+ works locally.
- No separate build/lint/test runner config — orchestration lives in `devEnv/cli.ts` (run via `yarn cli <cmd>`).

## Essential commands (run from repo root)

| Task | Command |
| --- | --- |
| Install | `yarn` (also runs `husky install` via `postinstall`) |
| Build all packages | `yarn cli build` |
| Clean build artifacts | `yarn cli build clean` |
| Typecheck all projects | `yarn typecheck` → `tsc --build devEnv/typecheck-all-projects/tsconfig.all.json` |
| Lint (CI mode) | `yarn lint:all --max-warnings 0` (lint needs `NODE_OPTIONS=--max_old_space_size=4096` in CI) |
| Lint autofix | `yarn lint:all --fix` |
| Unit/integration tests | `yarn test` (`--watch` supported) |
| Single test file | `yarn test path/to/file.test.ts` |
| E2E tests (playwright) | `yarn test:e2e` (headed) or `yarn test:e2e:ci` (chromium, dot reporter) |
| Compat tests | `yarn test:compat:install` then `yarn test:compat:run` (two-step; install runs a local verdaccio) |
| Docs (VitePress) | `yarn docs:dev` / `yarn docs:build` |
| Unified static site (Netlify) | `yarn build:site` → `deploy/` (docs + playground) |
| Dev playground | `yarn playground` (= `yarn workspace playground run serve`, Vite, rebuilds packages on the fly) |
| Release | `yarn cli release x.y.z[-dev|rc.w]` (maintainers only; needs clean git tree) |

CI order (`.github/workflows/ci.yml`): `Build`, `Docs`, `Lint`, `Test`, `Typecheck`, `VisualRegression`, `Compatibility-Tests` — all run in parallel jobs on Node 22. A passing PR must satisfy all seven.

## Architecture / package boundaries

Yarn workspaces: `packages/*`, `examples/*`, `theatre`, `compat-tests`, `docs`. **All published packages share one version number** (set in root `package.json` and bumped by the release CLI). Release uses fixed-version mode in `devEnv/cli.ts` (not Lerna).

Published packages → source location:
- `@unseenco/theatre-core` → `theatre/core/` — runtime animation library (Apache-2.0, ships in user bundles)
- `@unseenco/theatre-studio` → `theatre/studio/` — visual editor (AGPL-3.0, dev-time only)
- `@unseenco/theatre-threejs` → `packages/threejs/` — Three.js helpers + Studio extension (AGPL-3.0). Package root is runtime-only (`autoAddObject`, etc.); Studio `buildExtension` is `@unseenco/theatre-threejs/extension`. When developing this package, read `packages/threejs/AGENTS.md`.
- `@unseenco/theatre-dataverse` → `packages/dataverse/` — reactive dataflow (published; API reference generated into VitePress via api-extractor)
- `@unseenco/theatre-react` → `packages/react/`
- `@unseenco/theatre-browser-bundles` → `packages/browser-bundles/`

Non-published: `packages/playground` (dev harness + e2e), `theatre/shared` (`private: true`), `theatre/devEnv`, `compat-tests`, `docs` (`@unseenco/theatre-docs`), `examples/basic-dom`.

TypeScript path aliases (`tsconfig.base.json`) map `@unseenco/theatre-*` directly to `src/index.ts` of each package — imports resolve to source, not `dist`. Jest uses the same aliases (see `devEnv/getAliasesFromTsConfig.ts`). Don't add relative cross-package imports; use the `@unseenco/theatre-*` aliases.

## Build / codegen quirks

- `yarn cli build` runs TypeScript solution build AND each package's own `build` script in parallel. A package's `build` typically emits dist via esbuild (`devEnv/build.ts` per package) plus `api-extractor` for the public API surface. `@unseenco/theatre-dataverse` also runs `build:api-json`.
- `yarn docs:build` runs `docs/scripts/generate-api-reference.mjs` (api-extractor + api-documenter) then VitePress. Generated API markdown lives in `docs/api/` (gitignored).
- `examples/*` consume built `dist/` output — you MUST `yarn cli build` before running any example (`cd examples/<name> && yarn start`). The `playground` is the exception: it rebuilds packages live via Vite.
- Types are emitted with `declarationMap`; consumers in the monorepo still resolve to source via path aliases.

## Testing quirks

- Jest config picks up `packages/*/src/**/*.test.ts`, `theatre/*/src/**/*.test.ts`, `devEnv/**/*.test.ts`. Compat tests use a **separate** config (`jest.compat-tests.config.js`) — `yarn test` will not run them.
- `moduleNameMapper` rewrites ES-module-only deps (`uuid`, `nanoid`, `lodash-es`, `react-use/esm`, css/svg/png) — if a test fails on a missing ESM export, add the mapping here rather than changing the import.
- `setupFiles: theatre/shared/src/setupTestEnv.ts` is loaded for every unit test.
- E2E (playwright) tests live in `packages/playground/src/tests/<name>/*.e2e.ts`. Run from the playground workspace, not root: `cd packages/playground && yarn test`. Filter with `--project=firefox`, `--headed`, `--debug` (inspector). Use `yarn playwright codegen http://localhost:8080/tests/<name>` after `yarn serve`.
- **Visual regression** only runs in CI (Linux VM). To reproduce locally use `docker-compose up -d` then `docker-compose exec -it node bash` → `yarn && yarn test:e2e:ci`. If you can't use Docker, ask maintainers to update screenshots.
- **Compat tests** are two-phase: `test:compat:install` spins up verdaccio, publishes a real build, and runs `npm install` in each `compat-tests/fixtures/*/package`. Primary fixture: **Vite + React 18** (`vite-react18`).

## Pre-commit hook

`.husky/pre-commit` runs `yarn lint-staged` only (eslint + prettier).

## Release flow (do not run unless asked)

`yarn cli release x.y.z` (see `devEnv/cli.ts`):
- Valid version shapes: `x.y.z`, `x.y.z-dev.w`, `x.y.z-rc.w`, `x.y.z-beta.w` (regex-enforced).
- Requires a clean git tree; sets `THEATRE_IS_PUBLISHING=1` so packages' `prepublish` guards pass.
- Bumps versions in all `packagesWhoseVersionsShouldBump` (root + each package JSON), builds, commits + tags with the version string, then `npm publish --access public --tag <latest|dev|rc|beta>`.

## Workflow conventions

- Squash-and-merge preferred for PRs unless history matters (then rebase). Always rebase feature branch onto `main` before merging.
- Core contributors branch from `main` as `feature/<id>`, `hotfix/<id>`, or `docs/<id>` (or the autogenerated GitHub issue branch).
- VSCode task "Typescript watch" runs `yarn typecheck --watch`.
- `packages/playground/src/personal/**` is gitignored — use it for throwaway experiments; `src/shared/<name>/index.tsx` is the committed playground pattern. Every playground needs `index.tsx`.

## Cursor Cloud specific instructions

- Standard commands are in the tables above; the update script only runs `yarn` (install) on startup. Build/lint/test/run are not run automatically — run them yourself as needed.
- Node 22 is installed here and works for the full flow (`yarn cli build`, `yarn typecheck`, `yarn lint:all`, `yarn test`, `yarn docs:build`).
- Running the app: `yarn playground` (Vite). It auto-selects a free port and does NOT always use 8080 — read the "Local:" URL it prints. Demo pages route as `/<group>/<module>/`, e.g. `/shared/dom/` loads the Studio editor controlling a DOM element.
