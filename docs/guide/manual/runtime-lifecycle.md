# Runtime lifecycle

Backstage keeps **project state** (JSON) separate from **loaded sheet/object instances** in memory. These APIs list or tear down instances without erasing saved overrides and sequence data—recreating the same sheet or object key picks up prior Studio values.

## Listing

```ts
const sheets = project.getSheets() // currently loaded sheets
const objects = sheet.getObjects() // objects on this sheet (excludes sheet.props carrier)
```

## Detach one object

```ts
sheet.detachObject('My Object')
```

Backstage remembers detached values; calling `sheet.object('My Object', …)` again restores prior static values.

## Unload sheets

```ts
sheet.unload() // detach all objects, pause sequences, remove this sheet instance

project.unloadSheet('Scene') // one sheet id (all instances if no instance id)
project.unloadSheet('Button', 'Submit') // one instance only
project.unloadSheets() // every loaded sheet
```

Useful when swapping scenes, tearing down React routes, or disposing a Three.js extension without clearing `localStorage` project data.

## Hiding from the outline

Extension internals or programmatic-only objects can stay out of the Studio outline:

```ts
project.sheet('Internal', {visible: false})

sheet.object('Debug / helper', {x: 0}, {visible: false})
```

## Outline folders

Pre-declare outline namespace folders (even when empty) and set default collapsed state:

```ts
sheet.declareOutlineNamespace('Environment / Lighting', {collapsed: true})
sheet.setOutlineNamespaceCollapsed('Environment / Lighting', false)
```

## Playground

**`/shared/unload-sheets/`** demonstrates list/unload APIs (`packages/playground/src/shared/unload-sheets`).

## API

[`Project.getSheets`](/api/backstage-core), [`Sheet.getObjects`](/api/backstage-core), [`Sheet.unload`](/api/backstage-core), [`Project.unloadSheet`](/api/backstage-core)
