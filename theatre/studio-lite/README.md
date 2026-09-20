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

`studio/index-lite.js` is currently the same size as full studio (~960 KiB minified): `index-lite.ts` re-exports the full studio entry, and sequence UI modules remain in the static import graph even when gated with `isTheatreLiteStudio()`. Further studio-lite savings need a separate import graph (esbuild stubs or lite-only panel entry points), similar to core-lite’s full-only module stubs.
