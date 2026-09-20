# Getting started with Theatre Lite

Theatre Lite splits **authoring** (AGPL studio-lite, dev only) from **runtime** (Apache core-lite, production).

## Install

```bash
yarn add @unseenco/theatre-core-lite @unseenco/theatre-studio-lite
```

Use the same version number for both packages (and for `@unseenco/theatre-threejs` if you use Three.js).

## Development: studio-lite + initialize

In your app entry (behind a dev flag or separate dev entry):

```ts
import {getProject, types} from '@unseenco/theatre-core-lite'
import studio from '@unseenco/theatre-studio-lite'

studio.initialize()

const project = getProject('My App')
const sheet = project.sheet('UI')
const obj = sheet.object('Card', {
  x: types.number(0),
  y: types.number(0),
})

obj.onValuesChange((values) => {
  // apply to DOM, canvas, etc.
})
```

Toggle Studio with `Alt`/`Option` + `\` (same as full Studio). Edit props in the Details Panel; use the outline to export JSON when you are ready to ship ([Projects](../manual/projects.md)).

Studio-lite does not offer **Sequence** on props—everything you edit is stored as static overrides.

### Optional: load state while authoring

```ts
import projectState from './state.json'

const project = getProject('My App', {state: projectState})
```

Re-export after edits so `state.json` matches what production will load.

## Production: core-lite only

Do **not** import `@unseenco/theatre-studio-lite` in production bundles. Tree-shake or use separate entries:

```ts
import {getProject} from '@unseenco/theatre-core-lite'
import projectState from './state.json'

const project = getProject('My App', {state: projectState})

project.ready.then(() => {
  // variants + onValuesChange handlers
})
```

The runtime ignores any sequence tracks that might still be present in older JSON; values come from defaults, static overrides, and variant static layers only.

## Export format

Exports use the same **`OnDiskState`** JSON as full Theatre. Studio-lite runs `stripSequenceDataFromOnDiskState` on export so files stay small and sequence-free when you never authored timelines.

Pass that file to `getProject('My App', { state })` in production—no migration step.

## Playground demos

In the monorepo playground (`yarn playground`):

| Path | Focus |
| --- | --- |
| `/shared/theatre-lite/` | DOM card, variants, export |
| `/shared/theatre-lite-three/` | Three.js + studio-lite extension |

## Related

- [Variants](./variants.md)
- [Three.js](./three-js.md)
- [Choosing lite or full](./choosing-lite-or-full.md)
