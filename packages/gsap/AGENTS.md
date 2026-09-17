# AGENTS.md — `@unseenco/theatre-gsap`

Bridge GSAP tweens to Theatre.js **sequence time mode** (v1). ScrollTrigger / page scroll modes are planned for v2 — see notes at the end.

Studio GSAP UI (outline context menu, sequencer clips, detail actions) is built into `@unseenco/theatre-studio` — there is no separate `/extension` entry for this package.

## Package layout

| Entry | Purpose |
| --- | --- |
| `@unseenco/theatre-gsap` | Runtime: `registerGsapAnimation`, `attachGsapSequenceBridge`, `configureTheatreGsap` |

Peers: `gsap`, `@unseenco/theatre-core`.

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

studio.initialize()
```

Clips are stored as `GsapClipTrack` rows on the outline proxy object (`GSAP/<label>`). Runtime reads them via `sheet.sequence.__experimental_getGsapClips()` and sets `animation.progress(localProgress, true)`.

## Commands

| Task | Command |
| --- | --- |
| Build package | `yarn workspace @unseenco/theatre-gsap run build` |
| Monorepo typecheck | `yarn typecheck` |
| Unit tests | `yarn test packages/gsap theatre/shared/src/sequence/trackData.test.ts` |

Register in root `devEnv/cli.ts`, `tsconfig.base.json`, and `devEnv/typecheck-all-projects/tsconfig.all.json` when adding exports (already done for this package).

## v2 notes (not implemented)

- **ScrollTrigger**: map scroll position instead of `sequence.pointer.position`.
- **Page / route modes**: multiple sequences per route; clips may need variant-aware binding.
- Manual playground: `yarn playground` → `/shared/gsap-time-mode/`
