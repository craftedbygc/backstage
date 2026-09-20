# Three.js with Theatre Lite

[`@unseenco/backstage/threejs`](/guide/extensions/threejs.md) supports both full Theatre and lite: `autoAddObject`, `autoAddMaterial`, and `autoAddCamera` only need `ISheet` and `onValuesChange`, so they work with `@unseenco/backstage/core-lite`.

## Peer dependencies

In `package.json`, declare peers for the stack you ship—**one** core and **one** studio per app:

| Runtime | Studio (dev) |
| --- | --- |
| `@unseenco/backstage` | `@unseenco/backstage/studio` |
| `@unseenco/backstage/core-lite` | `@unseenco/backstage/studio-lite` |

Do not mix full core with studio-lite (or core-lite with full studio) in the same bundle.

## Studio extension

Import the extension from **`/extension`** so production does not pull Studio:

```ts
import studio from '@unseenco/backstage/studio-lite'
import extension from '@unseenco/backstage/threejs/extension'

studio.initialize()
studio.extend(
  extension({
    renderer,
    studio,
    scenes: [{name: 'Main', scene, camera}],
  }),
)
```

Runtime in production:

```ts
import {autoAddObject} from '@unseenco/backstage/threejs'
import {getProject} from '@unseenco/backstage/core-lite'
```

See the [Three.js extension guide](/guide/extensions/threejs.md) for `configureTheatreThreejs`, shared materials, and orbit mode—the APIs are the same; only package names change.

## Playground reference

Monorepo playground (`yarn playground`):

- **`/shared/theatre-lite-three/`** — core-lite + studio-lite + Three.js extension with bundled `state.json`.
- **`/shared/theatre-lite/`** — DOM-only lite demo (no Three.js).

### `?theatre-lite-peers` (playground only)

Lite Three.js demos in the playground import:

```ts
import {autoAddObject} from '@unseenco/backstage/threejs?theatre-lite-peers'
import {buildExtension} from '@unseenco/backstage/threejs/extension?theatre-lite-peers'
```

That query suffix is resolved by a **Vite plugin** in `packages/playground` so the demo graph aliases threejs peers to lite packages. **Do not use `?theatre-lite-peers` in published apps**—install and import `@unseenco/backstage/core-lite`, `@unseenco/backstage/studio-lite`, and normal `@unseenco/backstage/threejs` paths instead.

## Related

- [Getting started](./getting-started.md)
- [Variants](./variants.md)
