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

```ts
import projectState from './state.json'

const project = getProject('My Project', {state: projectState})
```

### Unsaved changes indicator

When loaded state diverges from the JSON you passed in `getProject({ state })`, Studio shows an **unsaved** indicator on the outline toggle. Export again before deploying so production matches what you authored.

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
