# GSAP extension

`@unseenco/theatre-gsap` bridges **GSAP** tweens and timelines to Theatre **sequence time mode** (v1). Register animations at runtime, then place them on the sheet sequence like keyframed props. **Page mode** (scroll-driven sequencer) and scroll drivers are documented in [Sheet sequence modes](../manual/sheet-modes.md). **ScrollTrigger** instances can be registered for **read-only** visualization on the page-mode sequencer (vertical scroll on the configured scroller, default document).

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
  bindGsapTickerToRafDriver,
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

bindGsapTickerToRafDriver(rafDriver, gsap)

void getProject('My project').ready.then(() => {
  const tween = gsap.to('.box', {x: 100, duration: 1, paused: true})
  registerGsapAnimation(tween, sheet, {label: 'Box move'})
})
```

### GSAP as the master clock

When GSAP should own timing (common for mixed GSAP + Theatre setups), use **`bindGsapTickerToRafDriver(rafDriver, gsap)`** after `setCoreRafDriver()`. It forwards `gsap.ticker` time (seconds) to `rafDriver.tick()` (milliseconds, like `performance.now()`).

To silence the one-time integration warning (for example in tests), pass **`suppressGsapTickerRafWarning: true`** to `configureTheatreGsap()`.

See the playground demo below for a full example with DOM targets and nested labels.

Sheet **time mode** semantics (default timeline, playback, audio): [Sheet sequence modes](../manual/sheet-modes.md#time-mode).

## Page mode (scroll-driven sequence)

Enable page mode on the sheet and the GSAP bridge together:

```ts
import {getProject} from '@unseenco/theatre-core'

const sheet = getProject('My project').sheet('Main', {
  sequenceMode: 'page',
  gsap: true,
})
```

`gsap: true` turns on **`attachGsapSequenceBridge`** and native document scroll sync when no custom **`scrollDriver`** is set. You can also call **`sheet.setSequenceMode('page')`**, **`attachTheatrePageScroll(sheet)`**, and **`attachGsapSequenceBridge(sheet)`** separately.

GSAP-specific notes in page mode:

- GSAP clip **`defaultDuration`** should be set in **percent** when adding clips (defaults to **10** if omitted in page mode, not tween seconds).

Core scroll wiring (`configureTheatrePageScroll`, Lenis, custom **`ScrollDriver`**, overflow elements): [Sheet sequence modes — page mode](../manual/sheet-modes.md#page-mode).

### GSAP page scroll + ScrollTrigger defaults

When using ScrollTrigger with a non-document scroller, align Theatre and GSAP:

```ts
import {configureTheatrePageScroll} from '@unseenco/theatre-core'
import {configureTheatreGsap} from '@unseenco/theatre-gsap'

configureTheatrePageScroll({scroller: document.documentElement})

configureTheatreGsap({
  pageScroll: {
    scroller: document.documentElement,
    // applyScrollTriggerDefaults: true — optional; sets ScrollTrigger.defaults({ scroller })
  },
})

const sheet = getProject('My project').sheet('Main', {
  sequenceMode: 'page',
  gsap: true,
  scrollDriver: driver, // e.g. createLenisScrollDriver(lenis) — see manual
})
```

Playground: **`/shared/gsap-page-mode/`** (native vertical scroll), **`/shared/gsap-page-mode-horizontal/`** (native horizontal scroll), **`/shared/gsap-page-mode-lenis/`** (Lenis + ScrollTrigger proxy + Theatre).

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
| **`label`** | Shown after the namespace; `/` segments nest in the outline and sequence tree. Optional — when omitted, Theatre uses the GSAP tween/timeline **`vars.id`** if set. |
| **`id`** | Stable clip id on the sheet object. Defaults to the sanitised object key (`GSAP / …`). Re-registering with the same id updates the registry entry. |
| **`defaultDuration`** | Clip length when first added to the sequence (defaults to tween duration in time mode; use **percent** in page mode). |
| **`onRebuildTimeline`** | Rebuild callback when native child timing edits cannot be applied in place (timelines with editable child spans). |

Animations are **paused** on registration so Theatre can set `progress` during sequence scrubbing and playback.

## ScrollTrigger (page mode, read-only sequencer)

Requires **`sequenceMode: 'page'`**, `gsap.registerPlugin(ScrollTrigger)`, and a ScrollTrigger whose **scroller and axis** match `configureTheatreGsap({ pageScroll: { scroller, axis } })` (default: document, vertical). Set **`horizontal: true`** on triggers (or **`pageScroll: { axis: 'horizontal' }`**, which applies `ScrollTrigger.defaults({ horizontal: true })`). Theatre maps each trigger’s resolved **`start` / `end`** scroll pixels along that axis to **0–100%** on the sequence. Bars are **read-only** in Studio; GSAP still drives scrubbing on scroll.

```ts
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {
  registerGsapScrollTrigger,
  registerAllGsapScrollTriggers,
} from '@unseenco/theatre-gsap'

gsap.registerPlugin(ScrollTrigger)

const sheet = project.sheet('Main', {sequenceMode: 'page', gsap: true})

// ScrollTrigger.create({ animation })
const tween = gsap.to('.box', {x: 200, duration: 1, paused: true})
const st = ScrollTrigger.create({
  trigger: '.section',
  start: 'top center',
  end: 'bottom center',
  scrub: true,
  animation: tween,
})
registerGsapScrollTrigger(st, sheet, {label: 'Box scrub'})

// timeline vars.scrollTrigger
gsap.timeline({
  scrollTrigger: {trigger: '.section', start: 'top top', end: '+=500', scrub: true},
  paused: true,
}).to('.box', {y: 100})

registerAllGsapScrollTriggers(sheet) // optional catch-all for getAll()
```

Outline proxies appear under **`GSAP / ScrollTriggers / …`**. They **automatically** show as read-only bars in the page-mode sequencer (no **Add to sequence at playhead**). Controlled tweens/timelines show as **child rows** under each trigger bar.

Page mode behaviour and scroller setup: [Sheet sequence modes](../manual/sheet-modes.md#page-mode).

## configureTheatreGsap

```ts
configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: true},
  pageScroll: {
    scroller: null, // native document (default)
    axis: 'vertical', // or 'horizontal' — sets ScrollTrigger.defaults scroller + horizontal
  },
  suppressGsapTickerRafWarning: false,
})
```

Returns `{ reset }` to restore the previous config. Namespace and outline collapse settings apply when the first GSAP object is registered on a sheet.

## Studio workflow

After registration, each animation appears as a **proxy sheet object** (no sequenced props). Built-in Studio UI provides:

- **Outline** — nested `GSAP` namespace; context menu **Add to sequence at playhead** / **Remove from sequence** for clip proxies (not ScrollTrigger proxies in page mode).
- **Detail panel** — same add/remove action when a GSAP object is selected. Selecting a registered tween, timeline, or ScrollTrigger proxy also shows **read-only** GSAP data: target pills (**Element** / **Object**), hover highlight on page elements (Element pills), and **vars** from the live GSAP instance (timeline children are grouped under the parent).
- **Sequence editor** — **GsapClipTrack** rows aligned to the parent clip; GSAP **timelines** expose child rows mapped from `getChildren()` with drag/resize and **Reset to original state** when timing diverges from baseline.

Only **one clip per registered animation** on the sequence at a time (toggle add/remove rather than stacking duplicates).

Runtime reads clip layout via `sheet.sequence.__experimental_getGsapClips()` (see [theatre-core API](/api/theatre-core)).

## Production bundles

Ship **`@unseenco/theatre-gsap`** and **`@unseenco/theatre-core`** in production when you need the bridge at runtime. Omit **`@unseenco/theatre-studio`** from production builds. GSAP remains a normal dependency.

## Playground

`yarn playground` → **`/shared/gsap-time-mode/`** — panel show/hide tweens, box motion, nested `UI / …` labels, and a rebuildable timeline choreo.

**`/shared/gsap-page-mode/`** — native vertical document scroll. **`/shared/gsap-page-mode-horizontal/`** — native horizontal scroll + horizontal ScrollTrigger. **`/shared/gsap-page-mode-lenis/`** — Lenis smooth scroll + custom `ScrollDriver`.

## API reference

[@unseenco/theatre-gsap API](/api/theatre-gsap)
