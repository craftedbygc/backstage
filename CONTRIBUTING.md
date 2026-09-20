# Contributing to Backstage.js

## Development workflow

### Setting up the environment

Make sure you have [**Node 22**](https://nodejs.org/) (or Node 18+) installed:

```sh
$ node -v
> v22.x.x
```

This repo uses **Yarn 3** via Corepack (`packageManager` in root `package.json`). After cloning, run `yarn` from the repo root; Yarn 3.2 is used automatically.

Then clone the repo:

```sh
$ git clone https://github.com/craftedbygc/backstage.git
$ cd backstage
```

And fetch the dependencies with yarn:

```sh
$ yarn
```

- This project uses [Yarn workspaces](https://yarnpkg.com/features/workspaces); `npm install` at the monorepo root will not work for development.

### Hacking with `playground`

The quickest way to start tweaking things is to run the `playground` package.

```sh
$ cd ./packages/playground
$ yarn serve
$ yarn cli build
# or, shortcut:
$ cd root
$ yarn playground
```

The playground is a bunch of ready-made projects that you can run to experiment
with Backstage.js.

Read more at
[`./packages/playground/README.md`](./packages/playground/README.md).

### Hacking with `examples/`

Other than `playground`, the [`examples/`](./examples) folder contains a few
small projects that use Backstage.js with [Vite](https://vitejs.dev) and other
build tools. This means that
unlike `playground`, you have to build all the packages before running the
examples.

You can do that by running the `build` command at the root of the repo:

```sh
$ yarn cli build
```

Then build any of the examples:

```sh
$ cd examples/basic-dom
$ yarn start
```

### Running unit/integration tests

We use a single [jest](https://jestjs.io/) setup for the repo. The tests files
have the `.test.ts` or `.test.tsx` extension.

You can run the tests at the root of the repo:

```sh
$ yarn test

# or run them in watch mode:
$ yarn test --watch
```

### Type checking

The packages in this repo have full typescript coverage, so you should be able
to get diagnostics and intellisense if your editor supports typescript.

You can also run a typecheck of the whole repo from the root:

```sh
$ yarn typecheck

# or in watch mode:
$ yarn typecheck --watch
```

- If you're using VSCode, we have a ["Typescript watch"](./.vscode/tasks.json)
  task for VSCode that you can use by
  [running](https://code.visualstudio.com/Docs/editor/tasks) "Run Task ->
  Typescript watch".
- If you wish to contribute code without typescript annotations, that's totally
  fine. We're happy to add the annotations to your PR.

### Linting

We're using a minimal [ESLint](https://code.visualstudio.com/Docs/editor/tasks)
setup for linting. If your editor supports ESLint, you should get diagnostics as
you code. You can also run the lint command from the root of the repo:

```sh
$ yarn lint:all
```

Some lint rules have
[autofix](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems),
so you can run:

```sh
$ yarn lint:all --fix
```

### Publishing to npm

Currently all packages share the
same version number. In order to publish to npm, you can run the `release`
script from the root of the repo:

```sh
$ yarn cli release x.y.z # npm publish version x.y.z
$ yarn cli release x.y.z-dev.w # npm publish version x.y.z-dev.w and tag it as "dev"
$ yarn cli release x.y.z-rc.w # npm publish version x.y.z-rc.w and tag it as "rc"
```


## Project structure

The [monorepo](https://en.wikipedia.org/wiki/Monorepo) consists of:

- `@unseenco/backstage` – The core animation library at
  [`./backstage/core`](./backstage/core).
- `@unseenco/backstage/studio` – The visual editor at
  [`./backstage/studio`](./backstage/studio).
- `@unseenco/backstage/dataverse` – The reactive dataflow library at
  [`./packages/dataverse`](./packages/dataverse).
- `@unseenco/backstage/react` – Utilities for using Backstage.js with React at
  [`./packages/react`](./packages/react).
- `playground` – The playground explained [above](#hacking-with-playground),
  located at [`./packages/playground`](./packages/playground)
- `examples/` \* A bunch of [examples](#hacking-with-examples) at
  [./examples](./examples).

In addition, each package may contain a `dotEnv/` folder that holds some
dev-related files, like bundle configuration, lint setup, etc.

## Commands

These commands are available at the root workspace:

```sh
# Run the playground. It's a shortcut for `cd ./playground; yarn run serve`
$ yarn playground

# Run all the tests.
$ yarn test

# Run tests in watch mode.
$ yarn test --watch

# Typecheck all the packages
$ yarn typecheck

# Typecheck all the packages in watch mode
$ yarn typecheck --watch

# Run eslint on the repo
$ yarn lint:all

# Run eslint and auto fix
$ yarn lint:all --fix

# Build all the packages
$ yarn cli build

```

> Yarn passes all extra parameters to the internal scripts. So, for example, if
> you wish to run the tests in watch mode, you can run `yarn test --watch`.

## Documentation

The libraries come bundled with typescript definitions with TSDoc comments. You
can explore the API if your editor is configured to display TSDoc comments.

Documentation (in-repo VitePress):

```sh
$ yarn docs:dev    # guides + generated API reference
$ yarn docs:build  # production build
```

Published site is built with `yarn build:site` (docs + playground) for Netlify.

## What to contribute

You can contribute with:

- Bug fixes
- Feature suggestions
- Features implementations
- Documentation in `docs/` (or write/record tutorials of your own which we'll showcase)
- Create examples projects for your own particular dev stack (eg. using
  Pixie/Vue/THREE.js/Babylon/etc)

### Helping with outstanding issues

Feel free to chime in on any
[issue](https://github.com/craftedbygc/backstage/issues).
if you're just getting started with the codebase.

## Sending pull requests

We use Github's regular PR workflow. Basically fork the repo, push your commits,
and send a pull request.

If you're a core contributor and have write access to the repo, you should
submit your pull requests from a branch rather than a personal fork. The naming
convention for these branches should be:

- `(feature|hotfix|docs)/[identifier]` or
- an autogenerated branch name from a Github issue (On an issue without a PR,
  look under the "Development" sidebar heading for a "create a branch link")

Squash & merge should be preferred most of the time to keep the main branch clean, unless the commit history is relevant, in which case rebase should be used.

Always update your feature branch with a rebase from the main branch to make sure that you don't accidentally break main with an undetected conflict.

Branches belonging to merged PRs should be deleted.
