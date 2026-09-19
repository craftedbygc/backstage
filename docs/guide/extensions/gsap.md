# GSAP extension

`@unseenco/theatre-gsap` bridges **GSAP** tweens and timelines to Theatre **sequence time mode** (v1). Register animations at runtime, then place them on the sheet sequence like keyframed props. **Page mode** (scroll-driven sequencer) is available via `@unseenco/theatre-core`; ScrollTrigger visualization in Studio is planned next.

Studio support for GSAP clips is **built into** `@unseenco/theatre-studio`. You do **not** call `studio.extend()` for GSAP.

## Install

```bash
yarn add @unseenco/theatre-core @unseenco/theatre-studio gsap @unseenco/theatre-gsap
```

Peer dependencies: `gsap` (≥3), `@unseenco/theatre-core`. `@unseenco/theatre-studio` is optional at runtime but required for authoring.

## Quick start (time mode)

Typical setup:

1. **`configureTheatreGsap()`** — outline namespace for proxy objects (default `GSAP`).
2. **`registerGsapAnimation()`** — bind a paused tween or timeline to a sheet; creates outline entries under `GSAP / …`.
3. **`attachGsapSequenceBridge(sheet)`** — drive registered animations from the sequence playhead.
4. In Studio — **Add to sequence at playhead** on a GSAP outline object (context menu, detail panel, or clip title menu).

```ts
import gsap from 'gsap'
import {
  createRafDriver,
  getProject,
  setCoreRafDriver,
} from '@unseenco/theatre-core'
import studio from '@unseenco/theatre-studio'
import {
  attachGsapSequenceBridge,
  configureTheatreGsap,
  registerGsapAnimation,
} from '@unseenco/theatre-gsap'

const rafDriver = createRafDriver({name: 'gsap-master-clock'})
setCoreRafDriver(rafDriver)

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
})

studio.initialize({__experimental_rafDriver: rafDriver})

const sheet = getProject('My project').sheet('Main')
attachGsapSequenceBridge(sheet)

void getProject('My project').ready.then(() => {
  const tween = gsap.to('.box', {x: 100, duration: 1, paused: true})
  registerGsapAnimation(tween, sheet, {label: 'Box move'})
})
```

### GSAP as the master clock

When GSAP should own timing (common for mixed GSAP + Theatre setups), tick Theatre from **`gsap.ticker`**:

```ts
gsap.ticker.add((time) => {
  rafDriver.tick(time * 1000)
})
```

See the playground demo below for a full example with DOM targets and nested labels.

## Page mode (scroll-driven sequence)

When a sheet uses **`sheet.setSequenceMode('page')`**, the sequence uses **0–100** as percent of page scroll (length fixed at **100**, snap steps **0.1%**). Drive the playhead with native document scroll:

```ts
import {
  attachGsapSequenceBridge,
  attachSheetScrollDriver,
  getProject,
} from '@unseenco/theatre-core'

const sheet = getProject('My project').sheet('Main')
sheet.setSequenceMode('page')
attachSheetScrollDriver(sheet)
attachGsapSequenceBridge(sheet)
```

- **`attachSheetScrollDriver(sheet)`** — bidirectional sync between `window` scroll and `sequence.position` (custom scroll drivers later).
- **`sequence.play()`** is disabled in page mode; scrub the playhead or scroll the page.
- GSAP clip **`defaultDuration`** should be set in **percent** when adding clips (defaults to **10** if omitted in page mode, not tween seconds).
- **`sequence.attachAudio()`** is not supported in page mode.

Playground: **`/shared/gsap-page-mode/`**.

## registerGsapAnimation

```ts
registerGsapAnimation(animation, sheet, {
  label: 'UI / Panel show',
  id: 'optional-stable-id',
  defaultDuration: 0.5,
  onRebuildTimeline: () => rebuiltTimeline,
})
```

| Option | Purpose |
| --- | --- |
| **`label`** | Shown after the namespace; `/` segments nest in the outline and sequence tree (e.g. `UI / Panel show`). |
| **`id`** | Stable clip id on the sheet object. Defaults to the sanitised object key (`GSAP / …`). Re-registering with the same id updates the registry entry. |
| **`defaultDuration`** | Clip length when first added to the sequence (defaults to tween duration). |
| **`onRebuildTimeline`** | Rebuild callback when native child timing edits cannot be applied in place (timelines with editable child spans). |

Animations are **paused** on registration so Theatre can set `progress` during sequence scrubbing and playback.

## configureTheatreGsap

```ts
configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: true},
})
```

Returns `{ reset }` to restore the previous config. Namespace and outline collapse settings apply when the first GSAP object is registered on a sheet.

## Studio workflow

After registration, each animation appears as a **proxy sheet object** (no sequenced props). Built-in Studio UI provides:

- **Outline** — nested `GSAP` namespace; context menu **Add to sequence at playhead** / **Remove from sequence**.
- **Detail panel** — same add/remove action when a GSAP object is selected.
- **Sequence editor** — **GsapClipTrack** rows aligned to the parent clip; GSAP **timelines** expose child rows mapped from `getChildren()` with drag/resize and **Reset to original state** when timing diverges from baseline.

Only **one clip per registered animation** on the sequence at a time (toggle add/remove rather than stacking duplicates).

Runtime reads clip layout via `sheet.sequence.__experimental_getGsapClips()` (see [theatre-core API](/api/theatre-core)).

## Production bundles

Ship **`@unseenco/theatre-gsap`** and **`@unseenco/theatre-core`** in production when you need the bridge at runtime. Omit **`@unseenco/theatre-studio`** from production builds. GSAP remains a normal dependency.

## Playground

`yarn playground` → **`/shared/gsap-time-mode/`** — panel show/hide tweens, box motion, nested `UI / …` labels, and a rebuildable timeline choreo.

## API reference

[@unseenco/theatre-gsap API](/api/theatre-gsap)
