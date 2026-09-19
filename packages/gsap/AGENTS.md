# AGENTS.md — `@unseenco/theatre-gsap`

Bridge GSAP tweens to Theatre.js **sequence time mode** (v1). ScrollTrigger / page scroll modes are planned for v2 — see notes at the end.

## Package layout

| Entry | Purpose |
| --- | --- |
| `@unseenco/theatre-gsap` | Runtime: `registerGsapAnimation`, `attachGsapSequenceBridge`, `configureTheatreGsap`, registry helpers |

Peers: `gsap`, `@unseenco/theatre-core`; optional `@unseenco/theatre-studio` for authoring.

Studio GSAP UI (outline menus, sequence clip tracks) lives in **`theatre/studio/src/gsap/`** — not a separate `studio.extend()` package export.

## Typical integration

```ts
import {getProject, onChange, types} from '@unseenco/theatre-core'
import studio from '@unseenco/theatre-studio'
import gsap from 'gsap'
import {
  attachGsapSequenceBridge,
  configureTheatreGsap,
  registerGsapAnimation,
} from '@unseenco/theatre-gsap'

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: true},
})

const project = getProject('My Project')
const sheet = project.sheet('Scene')
const tween = gsap.to('.box', {x: 100, duration: 2, paused: true})

registerGsapAnimation(tween, sheet, {label: 'Box move'})
attachGsapSequenceBridge(sheet)
```

Clips are stored as `GsapClipTrack` rows on the outline proxy object (`GSAP/<label>`). Runtime reads them via `sheet.sequence.__experimental_getGsapClips()` and sets `animation.progress(localProgress, true)`.

User-facing docs: `docs/guide/extensions/gsap.md`.

## Commands

| Task | Command |
| --- | --- |
| Build package | `yarn workspace @unseenco/theatre-gsap run build` |
| Monorepo typecheck | `yarn typecheck` |
| Unit tests | `yarn test packages/gsap theatre/shared/src/sequence/trackData.test.ts` |

Register in root `devEnv/cli.ts`, `tsconfig.base.json`, and `devEnv/typecheck-all-projects/tsconfig.all.json` when adding exports (already done for this package).

## v2 notes (partial)

- **Page mode (sequencer):** `project.sheet(id, { sequenceMode: 'page', gsap: true })` (or manual `setSequenceMode` / attach helpers) — see `docs/guide/extensions/gsap.md`. Playground: `/shared/gsap-page-mode/`.
- **ScrollTrigger (next):** visualize ScrollTrigger instances in the sequencer (read-only first).
- **Page / route modes (later):** multiple sequences per route; variant-aware binding.
- Time mode playground: `/shared/gsap-time-mode/`
