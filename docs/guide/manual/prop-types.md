# Prop types

Props are declared when you call `sheet.object()` or `sheet.props()`. Import constructors from `@unseenco/theatre-core`:

```ts
import {types} from '@unseenco/theatre-core'
```

## Shorthand vs explicit

```ts
sheet.object('key', {x: 0}) // number inferred

sheet.object('key', {
  x: types.number(0, {range: [0, 10], label: 'X'}),
})
```

`range` guides the Studio UI; it is not a runtime clamp unless you enforce it in `onValuesChange`.

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

Full prop-type surface: [theatre-core API](/api/theatre-core) (search for `types`).
