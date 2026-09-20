# `@unseenco/theatre-studio-lite`

AGPL dev-time editor for static prop authoring and export. No sequence editor, keyframes, or “Sequence this prop”.

Built from `theatre/studio/src` with `__THEATRE_LITE__` and published from `dist/` (copied from `theatre/studio/dist/index-lite.*` during `yarn workspace theatre build`).

Peers `@unseenco/theatre-core-lite`.

```ts
import studio from '@unseenco/theatre-studio-lite'

studio.initialize()
```

Optional on full studio for dogfooding: `studio.initialize({ mode: 'lite' })`.

## Bundle size

Run from the monorepo root after `yarn workspace theatre build:js`:

```bash
THEATRE_LITE_LOG_BUNDLE_SIZES=1 yarn workspace theatre build:js
```

Published `dist/index.js` is **minified** (same as full studio). Esbuild also prints unminified/minified comparison for `index.js`:

| Package | Unminified | Minified (published `dist`) | vs full studio |
| --- | ---: | ---: | ---: |
| `@unseenco/theatre-studio` | ~2150 KiB | ~960 KiB | — |
| `@unseenco/theatre-studio-lite` | ~1602 KiB | **~744 KiB** | **~23% smaller (~216 KiB)** |

### Excluded from the lite import graph (esbuild stubs)

The lite bundle replaces full-only modules with stubs (`theatre/devEnv/studioLiteEsbuildStubs.ts`):

- **Sequence editor UI** — entire `panels/SequenceEditorPanel/` tree except `sequenceEditLimits`, `whatPropIsHighlighted`, and `graphEditorColors` (dope sheet, graph editor, playback controls, GSAP sequencer rows, playhead, markers, etc.)
- **Sequenced prop UI** — `getNearbyKeyframesOfTrack`, `NextPrevKeyframeCursors`, `GsapClipSequenceIndicator`
- **Playback shortcuts** — `sequencePlayback` (space-to-play)
- **GSAP authoring UI** — `gsapOutlineMenuItems`, `GsapReadOnlyDetailsPanel`

Runtime behavior still uses `isTheatreLiteStudio()` to block sequencing state edits and hide timeline toolbar controls.
