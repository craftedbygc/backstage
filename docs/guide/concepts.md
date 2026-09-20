# Concepts

Backstage organizes animation around a small set of ideas. Once these click, the Studio UI and the `@unseenco/backstage` API feel consistent.

## Objects

**Everything you animate is an object.** An object can mirror a Three.js mesh, a DOM element, or a virtual value that never appears on screen.

You create objects with `sheet.object(name, props)` (or helpers such as `autoAddObject` from `@unseenco/backstage/threejs`).

## Props

**Objects are made of props.** Each prop has a type (`number`, `rgba`, `compound`, …) and can be tweaked in the Details Panel or sequenced on the timeline.

Props update from:

- The Studio (Details Panel, gizmos from extensions)
- Your code (`onValuesChange`, `onChange`, …)

## Sheets

A **sheet** groups objects that animate together. One sheet has one **sequence** (timeline) today; multi-sequence sheets are a future direction.

```ts
const sheet = project.sheet('Main')
const hero = sheet.object('Hero', { x: 0 })
sheet.sequence.play()
```

### Sheet instances

Reuse the same animation for multiple on-screen instances by passing an **instance id** as the second argument to `project.sheet()`:

```ts
const submit = project.sheet('Button', 'submit')
const cancel = project.sheet('Button', 'cancel')
submit.sequence.play() // does not affect cancel
```

### Sequence variants

The same sheet can switch between independent timelines (for example mobile vs desktop). See [Sheet sequence variants](./manual/sheet-variants.md).

### Sheet-level props

Some values belong to the sheet, not a visible object (global fog, layout toggles, shared parameters). Use **`sheet.props(config)`** instead of inventing a dummy object. Sheet props do not appear in `sheet.getObjects()` and share one hidden carrier object in the outline.

See [Sheets](./manual/sheets.md#sheet-level-props).

## Sequences

Each sheet’s **sequence** holds keyframes for all sequenced props on that sheet. The Sequence Editor (dope sheet) is where you add keyframes, edit curves, and set focus ranges.

## Extensions

**Extensions** add Studio UI and workflows: toolbar buttons, panes, viewport gizmos. `@unseenco/backstage/threejs/extension` and built-in GSAP clip authoring in Studio are the main extension-style workflows in this monorepo; you can author your own via the Studio API. See [GSAP](./extensions/gsap.md) and [Three.js](./extensions/threejs.md).

## What we skip here

**Projects** (save files), **prop type** constructors, and **playback APIs** are covered in the [manual](./manual/index.md) and [API reference](/api/backstage-core).
