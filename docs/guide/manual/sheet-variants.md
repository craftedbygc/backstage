# Sheet sequence variants

A sheet normally has one timeline. **Sequence variants** let the same sheet objects use **different keyframe data** per variant—for example `default`, `mobile`, and `desktop`—without duplicating sheets.

## Declaring variants

Call **`sheet.declareSequenceVariants()`** once per sheet before authoring variant-specific sequences. The `"default"` variant always exists; include it explicitly or omit it and it is added for you.

```ts
const sheet = project.sheet('Hero section')

sheet.declareSequenceVariants(['default', 'mobile', 'desktop'])
```

In Studio, variant folders appear under the sheet in the outline. Each variant has its own sequence tracks and static overrides for sequenced props.

## Switching at runtime

```ts
sheet.setActiveSequenceVariant('mobile')

// sheet.sequence now refers to the mobile variant’s timeline
sheet.sequence.play()
```

Read the active name with **`sheet.getActiveSequenceVariant()`**.

## Values callbacks

`onValuesChange` receives a second argument with the variant that produced the values:

```ts
obj.onValuesChange((values, meta) => {
  console.log(meta.variant) // e.g. 'mobile'
})
```

## Sheet-level props

[Sheet-level props](./sheets.md#sheet-level-props) (`sheet.props()`) are shared across variants—they are not duplicated per variant folder.

## API

[`declareSequenceVariants`](/api/backstage-core), [`setActiveSequenceVariant`](/api/backstage-core), [`getActiveSequenceVariant`](/api/backstage-core)
