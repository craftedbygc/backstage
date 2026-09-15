# Sheet objects

**Objects** are the animatable handles you create with `sheet.object()`. Each object has props (position, color, custom data).

## Creating objects

```ts
const obj = sheet.object('My Object', {position: {x: 0, y: 0}})
```

Shorthand nested objects infer compound props. Use `types.*` for labels, ranges, and literals (see [Prop types](./prop-types.md)).

## Reconfiguring

Add or remove props at runtime without reloading:

```ts
const obj = sheet.object('obj', {foo: 0})
const obj2 = sheet.object('obj', {bar: 0}, {reconfigure: true})
// obj === obj2; foo is gone, bar exists
```

The same effect on an existing handle:

```ts
obj.reconfigure({bar: 0, baz: 1}, {static: ['baz']})
```

Historic statics and sequence tracks for **removed** prop paths are stripped.

## Adding props

Use **`addProps()`** when you need new top-level props without replacing the whole config (unlike `reconfigure`):

```ts
const obj = sheet.object('Box', {x: 0})
obj.addProps({y: 0}) // throws if `y` already exists
```

Existing props and their saved statics/tracks are preserved.

## Linking another object’s props in Studio

**`showPropsOf`** embeds other objects’ props in this object’s Details Panel (UI-only). See [Linking props with showPropsOf](./show-props-of.md).

## Detaching

```ts
const unsubscribe = obj.onValuesChange(() => {})
unsubscribe()
sheet.detachObject('obj')
```

Theatre remembers detached values; recreating the same key restores prior static values.

## Namespacing

Use `/` in the object key for outline groups:

```ts
sheet.object('Basics / Boxes / box-0', {x: 0})
sheet.object('Basics / Boxes / box-1', {x: 0})
```

## Transient and static props

When creating or reconfiguring an object (or sheet props), you can mark paths:

- **`transient`** — excluded from exported state JSON (session-only tweaks, orbit flags, preview textures).
- **`static`** — saved but **cannot be sequenced** (constants you still want in the Details Panel).

```ts
sheet.object(
  'Camera',
  {zoom: 1, orbitEnabled: true},
  {
    transient: ['orbitEnabled'],
    static: ['zoom'],
  },
)
```

`@unseenco/theatre-threejs` **`autoAddObject()`** accepts the same `transient` / `static` paths (dot or array notation), merged with `configureTheatreThreejs()` defaults.

## API

[Sheet object API](/api/theatre-core#object)
