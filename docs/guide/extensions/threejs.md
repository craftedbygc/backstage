# Three.js extension

`@unseenco/backstage/threejs` provides runtime helpers and a Studio extension entry point.

## Install

```bash
yarn add @unseenco/backstage @unseenco/backstage/studio @unseenco/backstage/threejs three
```

> **Backstage Lite:** Peer `@unseenco/backstage/core-lite` and `@unseenco/backstage/studio-lite` instead for static + variant workflows. Runtime helpers and `/extension` work the same; see [Three.js with Backstage Lite](../backstage-lite/three-js.md).

## Studio (development)

Import the extension from the **`/extension`** subpath so production bundles do not pull Studio:

```ts
import studio from '@unseenco/backstage/studio'
import extension from '@unseenco/backstage/threejs/extension'

studio.initialize()
studio.extend(extension({renderer, studio, scenes: [{name: 'Main', scene, camera}]}))
```

Breaking change from upstream Backstage: **`buildExtension()` lives on `/extension`**, not the package root ([0.1.8 changelog](https://github.com/craftedbygc/backstage/blob/main/CHANGELOG.md)).

## autoAddObject

Registers a `THREE.Object3D` on a sheet with parsed transform, material, shader uniform, and texture props:

```ts
import {autoAddObject, configureBackstageThreejs} from '@unseenco/backstage/threejs'

configureBackstageThreejs({
  autoAddObject: {
    exclude: ['matrixAutoUpdate'],
    transient: ['material.map'], // session-only texture slots
    static: ['renderOrder'],
  },
})

const sheetObject = autoAddObject(mesh, sheet, {
  name: 'Hero mesh',
  // Merged with configureBackstageThreejs() defaults (dot or array paths)
  transient: ['someSessionFlag'],
  static: ['renderOrder'],
})
```

- **`transient`** / **`static`** — same semantics as `sheet.object()` ([Objects](../manual/objects.md)).
- Unit-interval material scalars (`opacity`, `roughness`, `metalness`, …) use a **0–1** Studio range.

## autoAddMaterial

Track a shared `Material` on its own sheet object (material props only—no mesh transform):

```ts
import {autoAddMaterial} from '@unseenco/backstage/threejs'

autoAddMaterial(material, sheet, {name: 'Glass'})
```

Call this before `autoAddObject()` when you want explicit control over the material object key.

## Shared materials

When a **second** `autoAddObject()` uses the same `Material` instance as an earlier mesh:

1. Material props move to a dedicated object under **`Shared Materials / <name>`**.
2. Both meshes link that object via **`showPropsOf`** ([showPropsOf](../manual/show-props-of.md)).
3. The first mesh stops applying material props locally.

Unnamed materials warn and fall back to a UUID-based key. Pass **`trackMaterial: false`** on `autoAddObject()` to keep material props on the mesh, or call **`autoAddMaterial()`** first to own the shared object.

Playground: **`/shared/three-basic-vanilla-devtools/`** (instanced grid + shared materials).

## autoAddCamera

Registers camera transform and lens props (`focalLength`, `near`, `far`, `zoom`) plus a viewport hitbox for orbit-mode picking.

## Scenes and orbit mode

`buildExtension()` config can register callbacks before persisted state restores:

```ts
studio.extend(
  extension({
    renderer,
    studio,
    scenes: [{name: 'Main', scene, camera}],
    onSceneSwitch: (name) => console.log('active scene', name),
    onOrbitModeSwitch: (orbit) => console.log('orbit mode', orbit),
  }),
)

// Later, from the returned API:
api.switchScene('Main') // or index
api.getActiveSceneName()
api.isOrbitMode()
const off = api.onSceneSwitch((name) => {})
off() // unsubscribe
```

Multi-scene setups hide sheets that only contain objects in **inactive** scenes from the outline (updates on scene switch).

## Selection sync

With `buildExtension()` active, clicking a registered mesh in the viewport selects it in the outline; outline selection shows a `BoxHelper` in orbit mode.

## Production

Ship only `@unseenco/backstage/threejs` runtime imports (`autoAddObject`, …). Do not import `/extension` or `@unseenco/backstage/studio` in production.

## API

[@unseenco/backstage/threejs API](/api/backstage-threejs)
