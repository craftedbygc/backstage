# With React Three Fiber

The upstream Theatre project shipped **`@theatre/r3f`**, a dedicated React Three Fiber extension. **This fork (`craftedbygc/theatre`) does not publish that package.** You can still use Theatre with R3F by wiring Three.js objects manually or via `@unseenco/theatre-threejs`.

## Recommended approach today

1. Install:

```bash
yarn add @unseenco/theatre-core @unseenco/theatre-studio @unseenco/theatre-threejs three @react-three/fiber react react-dom
```

2. Initialize Studio once (development only):

```ts
import studio from '@unseenco/theatre-studio'
import extension from '@unseenco/theatre-threejs/extension'

if (import.meta.env.DEV) {
  studio.initialize()
  studio.extend(extension)
}
```

3. Inside your R3F canvas, get a ref to a `THREE.Object3D` and register it:

```tsx
import {useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {getProject} from '@unseenco/theatre-core'
import {autoAddObject} from '@unseenco/theatre-threejs'

const project = getProject('R3F scene')
const sheet = project.sheet('Main')

function Box() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ref.current && !ref.current.userData.theatreRegistered) {
      autoAddObject(ref.current, sheet, {name: 'Box'})
      ref.current.userData.theatreRegistered = true
    }
  })
  return <mesh ref={ref}>...</mesh>
}
```

Prefer registering in `useLayoutEffect` when the object is stable; the pattern above is illustrative.

4. Export project state and pass `{state}` to `getProject` for production, same as the [THREE.js guide](./with-three-js.md).

## `@unseenco/theatre-react`

The monorepo includes **`@unseenco/theatre-react`** for binding Theatre to React trees (see package source and API JSON). It is not a drop-in replacement for the old `@theatre/r3f` JSX helpers; check the playground and package exports for current hooks.

## If you need the old `@theatre/r3f` API

Track [craftedbygc/theatre issues](https://github.com/craftedbygc/theatre/issues) or port bindings yourself using `sheet.object` / `autoAddObject`. Legacy getting-started copy that referenced `@theatre/r3f@0.5` is **not** ported verbatim.

## Next steps

- [Three.js extension](../extensions/threejs.md)
- [With THREE.js](./with-three-js.md) — core concepts without React
