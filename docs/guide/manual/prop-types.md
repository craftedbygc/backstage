# Prop types

Props are declared when you call `sheet.object()` or `sheet.props()`. Import constructors from `@unseenco/backstage`:

```ts
import {types} from '@unseenco/backstage'
```

## Shorthand vs explicit

```ts
sheet.object('key', {x: 0}) // number inferred

sheet.object('key', {
  x: types.number(0, {range: [0, 10], label: 'X'}),
})
```

`range` guides the Studio UI; it is not a runtime clamp unless you enforce it in `onValuesChange`.

## Number precision

Studio number inputs round and format using a resolved **precision** (decimal places):

- **Project default** — pass `numberPrecision` to `getProject()` (default **3**).
- **Per prop** — `types.number(default, {precision: 2})` overrides the project default for that prop.

```ts
const project = getProject('My Project', {numberPrecision: 2})

sheet.object('Fine', {
  // Uses project default (2 here)
  coarse: types.number(0),
  // Overrides to 4 decimals in Studio
  exact: types.number(0, {precision: 4}),
})
```

See [Projects](./projects.md) for where project config lives.

## Common types

| Type | Purpose |
| --- | --- |
| `types.number(default, opts?)` | Sliders, scrubbing, keyframed floats |
| `types.compound({ ... })` | Grouped props (e.g. `rotation.x/y/z`) |
| `types.boolean(default, opts?)` | Toggles |
| `types.string(default, opts?)` | Text; optional custom `interpolate` |
| `types.stringLiteral(default, labels)` | Enum / radio / switch UI |
| `types.rgba(default?)` | Colors |
| `types.image(default?, opts?)` | Image assets (see [Assets](./assets.md)) |

### String literals and switches

```ts
types.stringLiteral('a', {a: 'Option A', b: 'Option B'})
```

Pass object-level options `{as: 'switch', label: 'Mode'}` as the third argument to `sheet.object()` when needed.

## Sequencing

Props start **static**. Right-click in the Details Panel → **Sequence** to add tracks. Compound props can be sequenced as a group (**Sequence all**).

## Playground

Run `yarn playground` and open the **shared/dom** demo for many prop types in one scene.

## API

Full prop-type surface: [backstage-core API](/api/backstage-core) (search for `types`).
