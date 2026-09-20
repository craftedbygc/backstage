# `@unseenco/backstage/core-lite`

Apache-licensed production runtime for Backstage.js **static** prop values and **sheet-level variants**. No keyframe interpolation, sequence playback, GSAP bridge, or scroll drivers.

Built from `backstage/core/src` with `__BACKSTAGE_LITE__: true` and published from `dist/` (copied from `backstage/core/dist/index-lite.*` during `yarn workspace backstage build`).

The lite esbuild target uses `CoreBundleLite` (no `coreExports` full integrations) and build-time stubs for full-only sheet helpers (`sheetGetSequenceFull`, `sheetObjectSequencedFull`, `sheetPageScrollAndGsapFull`).

```ts
import {getProject, types} from '@unseenco/backstage/core-lite'

const project = getProject('app', {state: exportedJson})
const sheet = project.sheet('Scene')
sheet.declareSequenceVariants(['default', 'mobile'])
sheet.setActiveSequenceVariant('mobile')
```

Pair with `@unseenco/backstage/studio-lite` for authoring. `sheet.sequence` is an inert stub (`position` 0, `play()` no-op).

## Bundle size (esbuild, dataverse external)

Run from the monorepo root after `yarn workspace backstage build:js`:

```bash
BACKSTAGE_LITE_LOG_BUNDLE_SIZES=1 yarn workspace backstage build:js
```

Measured with `BACKSTAGE_LITE_LOG_BUNDLE_SIZES=1` (core `dist` is **unminified**; minified column from the same esbuild graph):

| Package | Unminified | Minified | vs full core |
| --- | ---: | ---: | ---: |
| `@unseenco/backstage` | ~318 KiB | ~139 KiB | — |
| `@unseenco/backstage/core-lite` | ~243 KiB | ~107 KiB | **~24% unminified / ~23% minified** |

Sequence interpolation, playback controllers, GSAP/scroll drivers, and full `coreExports` integrations are excluded from the lite import graph, not merely gated at runtime.
