# AGENTS.md — `@unseenco/theatre-gsap`

Bridge GSAP tweens to Theatre.js **sequence time mode** (v1). ScrollTrigger / page scroll modes are planned for v2 — see notes at the end.

## Package layout

| Entry | Purpose |
| --- | --- |
| `@unseenco/theatre-gsap` | Runtime: `registerGsapAnimation`, `attachGsapSequenceBridge`, `configureTheatreGsap` |
| `@unseenco/theatre-gsap/extension` | Studio: `buildExtension()` — outline context menu **Add to sequence at playhead** |

Peers: `gsap`, `@unseenco/theatre-core`; optional `@unseenco/theatre-studio` for `/extension`.

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
import {buildExtension} from '@unseenco/theatre-gsap/extension'

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: true},
})

const project = getProject('My Project')
const sheet = project.sheet('Scene')
const tween = gsap.to('.box', {x: 100, duration: 2, paused: true})

const {id} = registerGsapAnimation(tween, sheet, {label: 'Box move'})
attachGsapSequenceBridge(sheet)

const ext = buildExtension({studio})
studio.extend(ext.extension)
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
