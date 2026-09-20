# `@unseenco/theatre-core-lite`

Apache-licensed production runtime for Theatre.js **static** prop values and **sheet-level variants**. No keyframe interpolation, sequence playback, GSAP bridge, or scroll drivers.

Built from `theatre/core/src` with `__THEATRE_LITE__: true` and published from `dist/` (copied from `theatre/core/dist/index-lite.*` during `yarn workspace theatre build`).

The lite esbuild target uses `CoreBundleLite` (no `coreExports` full integrations) and build-time stubs for full-only sheet helpers (`sheetGetSequenceFull`, `sheetObjectSequencedFull`, `sheetPageScrollAndGsapFull`).

```ts
import {getProject, types} from '@unseenco/theatre-core-lite'

const project = getProject('app', {state: exportedJson})
const sheet = project.sheet('Scene')
sheet.declareSequenceVariants(['default', 'mobile'])
sheet.setActiveSequenceVariant('mobile')
```

Pair with `@unseenco/theatre-studio-lite` for authoring. `sheet.sequence` is an inert stub (`position` 0, `play()` no-op).

## Bundle size (esbuild, dataverse external)

Run from the monorepo root after `yarn workspace theatre build:js`:

```bash
THEATRE_LITE_LOG_BUNDLE_SIZES=1 yarn workspace theatre build:js
```

Measured unminified output (same options as CI `build:js`; core entries are **not** minified):

| Package | `index.js` | vs full |
| --- | ---: | --- |
| `@unseenco/theatre-core` | ~318 KiB | — |
| `@unseenco/theatre-core-lite` | ~243 KiB | **~24% smaller (~75 KiB)** |

Sequence interpolation, playback controllers, GSAP/scroll drivers, and full `coreExports` integrations are excluded from the lite import graph, not merely gated at runtime.
