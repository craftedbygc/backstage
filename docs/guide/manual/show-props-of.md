# Linking props with `showPropsOf`

Sometimes one on-screen thing is authored as several Backstage objects—for example a mesh and a shared **Appearance** object, or a layout box that should expose another object’s props in the same Details Panel.

**`showPropsOf`** embeds another sheet object’s props in an object’s Studio details pane. It is **UI-only**: edits and sequencing still target the **source** objects. Nothing about the link is stored in exported project JSON.

## At creation time

Pass `showPropsOf` when you call `sheet.object()`:

```ts
import {types} from '@unseenco/backstage'

const appearance = sheet.object('Appearance', {
  color: types.rgba({r: 0.2, g: 0.6, b: 1, a: 1}),
  borderRadius: types.number(8, {range: [0, 40]}),
})

const box = sheet.object(
  'Box / Hero',
  {position: {x: 0, y: 0}},
  {showPropsOf: [appearance]},
)
```

Linked props appear in fieldsets titled with the source object’s key. The fieldset title is clickable—it opens that source object in the Details Panel (the root compound row for the linked object is hidden so you edit leaves, not a duplicate root).

## After creation

```ts
box.showPropsOf([appearance]) // append or replace links
box.getShowPropsOf() // currently linked objects
box.showPropsOf([]) // clear all links
```

## Three.js shared materials

When two `autoAddObject()` meshes share one `Material`, the Three.js extension can move material props to a **Shared Materials** object and link both meshes via `showPropsOf`. See [Three.js extension](../extensions/threejs.md#shared-materials).

## Playground

Run `yarn playground` and open **`/shared/show-props-of/`** (`packages/playground/src/shared/show-props-of`).

## API

[`ISheetObject.showPropsOf`](/api/backstage-core), [`getShowPropsOf`](/api/backstage-core)
