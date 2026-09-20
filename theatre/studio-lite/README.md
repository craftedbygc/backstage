# `@unseenco/theatre-studio-lite`

AGPL dev-time editor for static prop authoring and export. No sequence editor, keyframes, or “Sequence this prop”.

Built from `theatre/studio/src` with `__THEATRE_LITE__` and published from `dist/` (copied from `theatre/studio/dist/index-lite.*` during `yarn workspace theatre build`).

Peers `@unseenco/theatre-core-lite`.

```ts
import studio from '@unseenco/theatre-studio-lite'

studio.initialize()
```

Optional on full studio for dogfooding: `studio.initialize({ mode: 'lite' })`.
