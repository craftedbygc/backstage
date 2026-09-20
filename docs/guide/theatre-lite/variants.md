# Variants in Theatre Lite

In lite, treat **sequence variants** as **sheet configuration profiles**: different static layouts for the same objects (for example `default`, `mobile`, `desktop`), not separate timelines.

The API names match full Theatre for upgrade compatibility: `declareSequenceVariants`, `setActiveSequenceVariant`, `getActiveSequenceVariant`.

## Declaring variants

Call **`sheet.declareSequenceVariants()`** once per sheet before relying on non-default variant folders:

```ts
const sheet = project.sheet('Hero')

sheet.declareSequenceVariants(['default', 'mobile', 'desktop'])
```

The `"default"` variant always exists. In studio-lite, variant rows appear in the outline; each variant has its own static override tree—**no** per-variant sequence length or playhead.

Full Theatre also stores **keyframes per variant** in `sequencesById`. Lite does not author or play those tracks; see [Sheet sequence variants](../manual/sheet-variants.md) for the full feature set.

## Switching at runtime

```ts
sheet.setActiveSequenceVariant('mobile')
```

`sheet.sequence` remains a stub in core-lite—do not call `play()` for layout switching.

Read the active name with **`sheet.getActiveSequenceVariant()`**.

## Values callbacks

```ts
obj.onValuesChange((values, meta) => {
  console.log(meta.variant) // e.g. 'mobile'
})
```

## How static values merge

- **Default variant:** `staticOverrides.byObject`.
- **Other variants:** `staticOverridesByVariant[variantId].byObject` merged over default when the object is assigned to that variant in Studio.

Studio-lite writes the same historic fields as full Studio for static data. Sequence tracks, if present in JSON from a full export, are ignored at runtime in core-lite.

## Sheet-level props

[`sheet.props()`](../manual/sheets.md#sheet-level-props) are shared across variants—they are not duplicated per variant folder (same as full Theatre).

## Variant list is not in JSON

The list of variant ids is **registered in code**, not stored in exported state. After deploy, call `declareSequenceVariants` with the **same ids** you used during authoring, or Studio preview and runtime resolution will not line up.

## API

[`declareSequenceVariants`](/api/theatre-core), [`setActiveSequenceVariant`](/api/theatre-core), [`getActiveSequenceVariant`](/api/theatre-core) — signatures match full core; use the lite packages in lite apps.
