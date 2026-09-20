# Theatre.js - Core

Theatre.js is an animation library for high-fidelity motion graphics. It is designed to help you express detailed animation, enabling you to create intricate movement, and convey nuance.

Theatre.js can be used both programmatically _and_ visually.

You can use Theatre.js to:

* Animate 3D objects made with THREE.js or other 3D libraries
* Animate HTML/SVG via React or other libraries
* Design micro-interactions
* Choreograph generative interactive art
* Or animate any other JS variable

## Documentation

Guides and API reference live in the monorepo `docs/` workspace. Run `yarn docs:dev` from the repo root, or see the deployed site from [craftedbygc/theatre](https://github.com/craftedbygc/theatre).

## Community

Join us on [Discord](https://discord.gg/bm9f8F9Y9N), follow the updates on [twitter](https://twitter.com/AriaMinaei) or write us an [email](mailto:hello@theatrejs.com).

## `@unseenco/theatre-core`

Theatre.js comes in two packages: `@unseenco/theatre-core` (the library) and `@unseenco/theatre-studio` (the editor). This package is the core library.

### `@unseenco/theatre-core-lite`

A second esbuild entry `src/index-lite.ts` emits `dist/index-lite.{js,mjs}` (published as `@unseenco/theatre-core-lite`). It sets `__THEATRE_LITE__` so sequenced value merging, playback, GSAP, and scroll drivers are excluded from the bundle. After `yarn workspace theatre build:js`, run:

```bash
THEATRE_LITE_LOG_BUNDLE_SIZES=1 yarn workspace theatre build:js
```

to print minified KiB sizes for full vs lite (`core`, `core-lite`, `studio`, `studio-lite`).

### Listing and unloading sheets / objects

Runtime helpers for tearing down loaded sheets and objects (for example when switching scenes). These drop in-memory instances so Studio stops showing them, but **do not** clear persisted project state. Recreating the same `sheetId` / object `key` restores prior prop overrides and sequence data.

```ts
import {getProject} from '@unseenco/theatre-core'

const project = getProject('My project')
const sheet = project.sheet('Scene')
sheet.object('Box', {x: 0, y: 0})

// List what is currently loaded
project.getSheets() // ISheet[]
sheet.getObjects() // ISheetObject[]

// Detach one object (sheet stays loaded)
sheet.detachObject('Box')

// Unload this sheet instance (all of its objects, then the sheet)
sheet.unload()

// Or from the project:
project.unloadSheet('Scene') // optional second arg: instanceId
project.unloadSheets() // unload every loaded sheet
```

Try the interactive demo in the playground: `/shared/unload-sheets/`.

## Bundle size

`@unseenco/theatre-core` is currently around 20KiB compressed with all its dependencies.

## License

Apache 2.0
