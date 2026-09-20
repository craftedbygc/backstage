# `@unseenco/theatre-core-lite`

Apache-licensed production runtime for Theatre.js **static** prop values and **sheet-level variants**. No keyframe interpolation, sequence playback, GSAP bridge, or scroll drivers.

Built from `theatre/core/src` with `__THEATRE_LITE__: true` and published from `dist/` (copied from `theatre/core/dist/index-lite.*` during `yarn workspace theatre build`).

```ts
import {getProject, types} from '@unseenco/theatre-core-lite'

const project = getProject('app', {state: exportedJson})
const sheet = project.sheet('Scene')
sheet.declareSequenceVariants(['default', 'mobile'])
sheet.setActiveSequenceVariant('mobile')
```

Pair with `@unseenco/theatre-studio-lite` for authoring. `sheet.sequence` is an inert stub (`position` 0, `play()` no-op).

## Bundle size (minified, esbuild)

Run from the monorepo root after `yarn workspace theatre build:js`:

```bash
THEATRE_LITE_LOG_BUNDLE_SIZES=1 yarn workspace theatre build:js
```

Example from `THEATRE_LITE_LOG_BUNDLE_SIZES=1` (esbuild bundles, core entries not minified):

| Package | `index.js` |
| --- | --- |
| `@unseenco/theatre-core` | ~366 KiB |
| `@unseenco/theatre-core-lite` | ~346 KiB (~5% smaller; drops sequence playback, interpolation merge, GSAP/scroll helpers) |
