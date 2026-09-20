# With React Three Fiber

The upstream Backstage project shipped **`@backstage/r3f`**, a dedicated React Three Fiber extension. **This fork (`craftedbygc/backstage`) does not publish that package.** You can still use Backstage with R3F by wiring Three.js objects manually or via `@unseenco/backstage/threejs`.

## Recommended approach today

1. Install:

```bash
yarn add @unseenco/backstage @unseenco/backstage/studio @unseenco/backstage/threejs three @react-three/fiber react react-dom
```

2. Initialize Studio once (development only):

```ts
import studio from '@unseenco/backstage/studio'
import extension from '@unseenco/backstage/threejs/extension'

if (import.meta.env.DEV) {
  studio.initialize()
  studio.extend(extension)
}
```

3. Inside your R3F canvas, get a ref to a `THREE.Object3D` and register it:

```tsx
import {useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {getProject} from '@unseenco/backstage'
import {autoAddObject} from '@unseenco/backstage/threejs'

const project = getProject('R3F scene')
const sheet = project.sheet('Main')

function Box() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ref.current && !ref.current.userData.backstageRegistered) {
      autoAddObject(ref.current, sheet, {name: 'Box'})
      ref.current.userData.backstageRegistered = true
    }
  })
  return <mesh ref={ref}>...</mesh>
}
```

Prefer registering in `useLayoutEffect` when the object is stable; the pattern above is illustrative.

4. Export project state and pass `{state}` to `getProject` for production, same as the [THREE.js guide](./with-three-js.md).

## `@unseenco/backstage/react`

The monorepo includes **`@unseenco/backstage/react`** for binding Backstage to React trees (see package source and API JSON). It is not a drop-in replacement for the old `@backstage/r3f` JSX helpers; check the playground and package exports for current hooks.

## If you need the old `@backstage/r3f` API

Track [craftedbygc/backstage issues](https://github.com/craftedbygc/backstage/issues) or port bindings yourself using `sheet.object` / `autoAddObject`. Legacy getting-started copy that referenced `@backstage/r3f@0.5` is **not** ported verbatim.

## Next steps

- [Three.js extension](../extensions/threejs.md)
- [With THREE.js](./with-three-js.md) — core concepts without React
