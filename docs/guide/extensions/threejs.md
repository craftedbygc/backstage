# Three.js extension

`@unseenco/theatre-threejs` provides runtime helpers and a Studio extension entry point.

## Install

```bash
yarn add @unseenco/theatre-core @unseenco/theatre-studio @unseenco/theatre-threejs three
```

## Studio (development)

Import the extension from the **`/extension`** subpath so production bundles do not pull Studio:

```ts
import studio from '@unseenco/theatre-studio'
import extension from '@unseenco/theatre-threejs/extension'

studio.initialize()
studio.extend(extension)
```

## autoAddObject

Registers a `THREE.Object3D` on a sheet with parsed transform, material, shader uniform, and texture props:

```ts
import {autoAddObject, configureTheatreThreejs} from '@unseenco/theatre-threejs'

configureTheatreThreejs({
  autoAddObject: {
    exclude: ['matrixAutoUpdate'],
    transient: ['material.map'],
  },
})

const sheetObject = autoAddObject(mesh, sheet, {
  name: 'Hero mesh',
  transient: ['someSessionFlag'],
  static: ['renderOrder'],
})
```

- **`transient`** / **`static`** — same semantics as `sheet.object()` ([Objects](../manual/objects.md)).
- **`autoAddMaterial`** — track a shared material on its own object.
- **`autoAddCamera`** — camera props and orbit helpers.

When two meshes share one `Material`, material props move to a **Shared Materials** object (see `packages/threejs/AGENTS.md`).

## Selection sync

With `buildExtension()` active, clicking a registered mesh in the viewport selects it in the outline; outline selection shows a `BoxHelper` in orbit mode.

## Production

Ship only `@unseenco/theatre-threejs` runtime imports (`autoAddObject`, …). Do not import `/extension` or `@unseenco/theatre-studio` in production.

## API

[@unseenco/theatre-threejs API](/api/theatre-threejs)
