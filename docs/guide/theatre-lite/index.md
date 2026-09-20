# Theatre Lite

**Theatre Lite** is a smaller Theatre.js stack for apps that ship **static prop values** and **sheet-level variants**, without timelines, keyframes, or sequence playback in production.

Use it when you author layout and design tokens in Studio, export JSON, and drive the page from `onValuesChange`—not when you need scrubbable timelines or GSAP/scroll sequences.

## Packages

| Package | License | Role |
| --- | --- | --- |
| [`@unseenco/backstage/core-lite`](https://www.npmjs.com/package/@unseenco/backstage/core-lite) | Apache-2.0 | Production runtime: projects, sheets, objects, prop types, static + variant value resolution, `onValuesChange` / `val`. |
| [`@unseenco/backstage/studio-lite`](https://www.npmjs.com/package/@unseenco/backstage/studio-lite) | AGPL-3.0-only | Dev-time editor: outline, details, variants, export. Peers `core-lite`. |

[`@unseenco/backstage/threejs`](/guide/extensions/threejs.md) stays one package: runtime helpers work with either core; the `/extension` entry peers full Studio or studio-lite.

Quick API notes live in the package READMEs under `theatre/core-lite/` and `theatre/studio-lite/` in the monorepo. This guide is the narrative walkthrough.

## Bundle size

Sizes are measured with esbuild (dataverse external). Reproduce from the monorepo after `yarn workspace theatre build:js`:

```bash
THEATRE_LITE_LOG_BUNDLE_SIZES=1 yarn workspace theatre build:js
```

| Package | Unminified | Minified | vs full |
| --- | ---: | ---: | ---: |
| `@unseenco/backstage` | ~318 KiB | ~139 KiB | — |
| `@unseenco/backstage/core-lite` | ~243 KiB | ~107 KiB | ~24% / ~23% smaller |
| `@unseenco/backstage/studio` | ~2150 KiB | ~960 KiB | — |
| `@unseenco/backstage/studio-lite` | ~1602 KiB | ~744 KiB | ~23% smaller |

Lite builds **exclude** sequence interpolation, playback controllers, GSAP/scroll drivers, and the full sequence editor UI from the import graph—not merely disabled at runtime.

## What lite does

- Same project id, object keys, prop schemas, and **`OnDiskState`** JSON shape as full Theatre (lite state is a valid subset).
- **Static overrides** on objects and [sheet-level props](../manual/sheets.md#sheet-level-props).
- **Sheet variants** via `declareSequenceVariants` / `setActiveSequenceVariant`—static override layers only ([Variants](./variants.md)).
- Studio-lite: outline, details, transactions, extensions, export (`createContentOfSaveFile`). Exports can strip sequence-only data automatically.
- Upgrade later by swapping packages; same `{ state }` loads in full Studio ([Upgrading to full](./upgrading-to-full.md)).

## What lite does not do

- Keyframes, sequenced props, or the Sequence Editor ([Sequences](../manual/sequences.md)).
- `sheet.sequence.play()`, scrubbing, audio on sequences, GSAP clip tracks, or [sheet sequence modes](../manual/sheet-modes.md) (page scroll, etc.).
- Persisting the variant **manifest** in JSON—apps must call `declareSequenceVariants([...])` with the same ids after deploy (variant static data *is* in JSON).

`sheet.sequence` exists for API compatibility but is an inert stub (`position` 0, `play()` no-op).

## Next steps

- [Choosing lite or full](./choosing-lite-or-full.md)
- [Getting started](./getting-started.md)
- [Variants](./variants.md)
- [Three.js](./three-js.md)
