# Assets

Image props use Backstage **assets**: files referenced by id and resolved at runtime via `project.getAssetUrl()`.

## Base URL

```ts
const project = getProject('My project', {
  assets: {baseUrl: '/backstage-assets'},
})
```

Defaults to `'/'` if omitted.

## Image props

```ts
const obj = sheet.object('My Object', {
  texture: types.image('', {label: 'Texture'}),
})
```

In Studio, assign files (stored in IndexedDB until exported). Exporting the project downloads a zip of assets—extract it under `assets.baseUrl`.

## Runtime

```ts
obj.onValuesChange((values) => {
  const url = project.getAssetUrl(values.texture)
  if (url) img.src = url
})
```

Texture props created by `@unseenco/backstage/threejs` `autoAddObject` treat image slots as transient where documented in [Three.js extension](../extensions/threejs.md).

## API

[`types.image`](/api/backstage-core), [`Project.getAssetUrl`](/api/backstage-core)
