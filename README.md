# @unseenco/theatre

A fork of [Theatre.js](https://github.com/theatre-js/theatre), maintained internally by Unseen Studio.

See [CHANGELOG.md](./CHANGELOG.md) for what's changed.

Theatre.js is a motion-design library for the web: you define animations in code and refine them in a visual editor (Studio). This fork publishes under the `@unseenco` npm scope (e.g. `@unseenco/backstage`, `@unseenco/backstage/studio`).

For the original project, docs, and community, see [theatrejs.com](https://unseen-theatre.netlify.app).

## Packages

| Package | Description |
| --- | --- |
| [`@unseenco/backstage`](./backstage/core/README.md) | Runtime animation library (ships in production bundles) |
| [`@unseenco/backstage/studio`](./backstage/studio/README.md) | Visual editor (dev-time only) |
| [`@unseenco/backstage/threejs`](./packages/threejs/README.md) | Three.js Studio devtools extension — orbit camera and scene inspection (dev-time only) |
| [`@unseenco/backstage/dataverse`](./packages/dataverse/README.md) | Reactive dataflow library used internally |
| [`@unseenco/backstage/react`](./packages/react/README.md) | React bindings |
| [`@unseenco/backstage/browser-bundles`](./packages/browser-bundles/README.md) | Pre-built browser bundles |

## Development

```bash
yarn                  # install dependencies
yarn cli build        # build all packages
yarn typecheck        # typecheck
yarn test             # unit tests
yarn playground       # local dev playground (Vite)
```

See [AGENTS.md](./AGENTS.md) and [CONTRIBUTING.md](./CONTRIBUTING.md) for more detail.

## Release

Publishing is done via the release CLI (requires a clean git tree and npm access to the `unseenco` org):

```bash
yarn cli release x.y.z
```

## License

This fork inherits the upstream licenses:

- `@unseenco/backstage` and most packages: **Apache-2.0**
- `@unseenco/backstage/studio`: **AGPL-3.0** (editor only; not included in production bundles)
- `@unseenco/backstage/threejs`: **AGPL-3.0** (Studio extension only; not included in production bundles)

Original copyright notices are preserved in each package's `LICENSE` file.
