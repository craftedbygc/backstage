# Projects

All Theatre work lives in a **project**. One page often uses a single project; you can create several with different names.

## Creating a project

```ts
import {getProject} from '@unseenco/theatre-core'

const project = getProject('My Project')
```

`getProject` is idempotent: the same name returns the same instance.

## State

Project **state** is the JSON snapshot of sheets, objects, keyframes, and overrides. With Studio open, edits are stored in the browser (typically `localStorage`). For shipping, export state from the outline and load it in code.

> **Theatre Lite:** The same export/import flow works for static-only projects—load `{ state }` in `@unseenco/theatre-core-lite` and omit Studio from production. See [Theatre Lite — Getting started](../theatre-lite/getting-started.md).

```ts
import projectState from './state.json'

const project = getProject('My Project', {state: projectState})
```

Optional project config:

```ts
const project = getProject('My Project', {
  state: projectState,
  numberPrecision: 2, // Studio number formatting (default 3)
})
```

See [Prop types — number precision](./prop-types.md#number-precision).

### Unsaved changes indicator

When in-memory state diverges from the JSON you passed to `getProject({ state })`, Studio surfaces it in several places:

- **Outline toolbar** — orange warning badge on the outline toggle; tooltip points to dirty rows.
- **Outline rows** — objects show a **dirty circle** (hollow when matching loaded JSON, filled when static overrides or sequence tracks diverge).
- **Details Panel** — diverged props can be reverted via context menu (**Revert to saved value** / **Revert all to saved value** on compounds).

Export again before deploying so production matches what you authored. Details: [Studio — saved vs in-memory state](./studio.md#saved-vs-in-memory-state).

### Assets base URL

If you use image props, configure where exported assets live:

```ts
const project = getProject('My Project', {
  state: projectState,
  assets: {baseUrl: '/theatre-assets'},
})
```

See [Assets](./assets.md).

## Ready

Studio loads projects asynchronously. Wait before playing:

```ts
project.ready.then(() => {
  console.log('Project loaded')
})
```

Use [`Project.isReady`](/api/theatre-core) for a synchronous check.

## API

[Project API](/api/theatre-core#project)
