# Backstage.js — `@unseenco/backstage`

Motion design for the web: define animations in code and refine them in **Studio**, a visual editor. This npm package bundles the runtime library, Studio, and optional integrations behind a single install.

## Install

```bash
npm install @unseenco/backstage
```

Peer dependencies (`gsap`, `three`, `react`, `react-dom`, `lenis`) are optional — install only what your project uses.

## Subpath exports

| Import | Purpose |
| --- | --- |
| `@unseenco/backstage` | Core runtime animation library |
| `@unseenco/backstage/studio` | Visual editor (dev-time) |
| `@unseenco/backstage/core-lite` | Core without optional integrations |
| `@unseenco/backstage/studio-lite` | Studio lite build |
| `@unseenco/backstage/dataverse` | Reactive dataflow primitives |
| `@unseenco/backstage/react` | React bindings |
| `@unseenco/backstage/threejs` | Three.js runtime helpers |
| `@unseenco/backstage/threejs/extension` | Three.js Studio extension (dev-time) |
| `@unseenco/backstage/gsap` | GSAP integration |
| `@unseenco/backstage/browser-bundles/*` | Pre-built browser bundles |

## Documentation

[https://backstage.unseen.co/docs/](https://backstage.unseen.co/docs/)

## Repository

[https://github.com/craftedbygc/backstage](https://github.com/craftedbygc/backstage)

## License

Licensing varies by subpath. The core runtime and most libraries are **Apache-2.0**. **Studio** and the **Three.js Studio extension** are **AGPL-3.0** (dev-time tooling; not intended for production bundles). Full license texts are included in this package (`LICENSE`, `LICENSE-APACHE-*`, `LICENSE-AGPL-*`).
