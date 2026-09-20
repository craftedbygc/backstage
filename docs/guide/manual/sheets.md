# Sheets

A **sheet** is a group of [objects](./objects.md) animated on one timeline (one **sequence** per sheet today).

## Creating sheets

```ts
const sheet = project.sheet('My Sheet')
```

Calling `project.sheet('My Sheet')` again returns the same sheet.

## Playback

```ts
sheet.sequence.play()
```

Options (`iterationCount`, `range`, `rafDriver`, …) are documented on [`Sequence.play`](/api/backstage-core).

## Sheet instances

Use a second argument for instance ids when the same animation drives multiple UI elements:

```ts
const submit = project.sheet('Button', 'Submit')
const cancel = project.sheet('Button', 'Cancel')
```

`submit.sequence.play()` does not affect `cancel`.

## Sequence variants

One sheet can host multiple timelines (`default`, `mobile`, …) with independent keyframe data. See [Sheet sequence variants](./sheet-variants.md).

## Sequence modes

Sheets use **time mode** (seconds timeline) by default, or **page mode** (0–100% scroll). See [Sheet sequence modes](./sheet-modes.md).

## Sheet-level props

Use **`sheet.props(config)`** for parameters that belong to the sheet rather than a scene object—for example global background mode, layout constants, or values shared across sequence variants.

```ts
import {types} from '@unseenco/backstage'

const sheetProps = sheet.props({
  sceneOpacity: types.number(1, {range: [0, 1]}),
})

sheetProps.onValuesChange((values) => {
  document.body.style.opacity = String(values.sceneOpacity)
})
```

Characteristics:

- Not listed in `sheet.getObjects()` (hidden carrier object in the outline).
- The reserved internal key cannot be used with `sheet.object()`.
- Supports **`reconfigure`**, **`transient`**, and **`static`** like `sheet.object()` (see [Objects](./objects.md)).

The playground DOM demo (`packages/playground/src/shared/dom`) uses `sheet.props()` for toolbar and scene-wide values.

## API

[Sheet API](/api/backstage-core#sheet)
