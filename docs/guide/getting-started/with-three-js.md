# With THREE.js

Animate a Three.js scene by wiring meshes to Backstage sheet objects. This guide follows the classic torus-knot tutorial pattern; package names match **craftedbygc/backstage** (`@unseenco/backstage-*`).

## Prerequisites

You need a bundler (Vite recommended) and a basic Three.js scene. The upstream sample repo [vanilla-threejs-project](https://github.com/fulopkovacs/vanilla-threejs-project) still works as a starting point.

```bash
git clone https://github.com/fulopkovacs/vanilla-threejs-project
cd vanilla-threejs-project
yarn install
yarn dev
```

## Install Backstage

```bash
yarn add @unseenco/backstage @unseenco/backstage/studio
```

Optional: add **`@unseenco/backstage/threejs`** if you want `autoAddObject()` and the Studio Three.js extension (see [Three.js extension](../extensions/threejs.md)).

## Initialize Studio

In your entry file (e.g. `main.ts`):

```ts
import studio from '@unseenco/backstage/studio'

studio.initialize()
```

Press `Alt`/`Option` + `\` to show or hide Studio.

## Create a project and sheet

```ts
import {getProject, types} from '@unseenco/backstage'

const project = getProject('THREE.js x Backstage')
const sheet = project.sheet('Animated scene')
```

Projects persist in the browser while Studio is open. Export JSON from the outline when you need a portable state file (see [Projects](../manual/projects.md)).

## Bind the mesh

After you create a mesh and add it to the scene:

```ts
const torusKnotObj = sheet.object('Torus Knot', {
  rotation: types.compound({
    x: types.number(mesh.rotation.x, {range: [-2, 2]}),
    y: types.number(mesh.rotation.y, {range: [-2, 2]}),
    z: types.number(mesh.rotation.z, {range: [-2, 2]}),
  }),
})

torusKnotObj.onValuesChange((values) => {
  const {x, y, z} = values.rotation
  mesh.rotation.set(x * Math.PI, y * Math.PI, z * Math.PI)
})
```

## Animate in Studio

1. Select the object in the outline.
2. In the Details Panel, right-click a prop → **Sequence**.
3. Add keyframes in the Sequence Editor (click the diamond next to a prop at different times).
4. Press `Space` to play.

More detail: [Working with sequences](../manual/sequences.md).

## Production

1. Export project state to `state.json` from the outline menu.
2. Pass it into `getProject`:

```ts
import projectState from './state.json'

const project = getProject('THREE.js x Backstage', {state: projectState})
```

3. Play when ready:

```ts
project.ready.then(() => {
  sheet.sequence.play({iterationCount: Infinity})
})
```

4. **Do not** call `studio.initialize()` in production (gate it with `import.meta.env.DEV` or equivalent).

### Three.js helper (optional)

Instead of hand-written `sheet.object` + `onValuesChange`, you can register meshes with:

```ts
import {autoAddObject} from '@unseenco/backstage/threejs'
import extension from '@unseenco/backstage/threejs/extension'

studio.extend(extension)
autoAddObject(mesh, sheet)
```

Use `transient` / `static` prop paths when you need session-only or non-sequenced props (see [Three.js extension](../extensions/threejs.md)).

## Next steps

- [Manual](../manual/index.md)
- [API: `getProject`](/api/backstage-core#getproject)
