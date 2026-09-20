# Sheet sequence modes

Each sheet’s **sequence** runs in one of two modes:

| Mode | Playhead unit | Typical use |
| --- | --- | --- |
| **Time** (`'time'`, default) | Seconds on a timeline | Playback with `sequence.play()`, audio, focus ranges |
| **Page** (`'page'`) | **0–100** = percent of scroll on the configured scroller | Scroll-driven layouts; sequencer length is fixed at **100** (snap **0.1%**) |

Set the mode when you create the sheet or switch later with **`sheet.setSequenceMode('time' | 'page')`**. Read the current mode with **`sheet.getSequenceMode()`**.

For **GSAP** clips, ScrollTrigger visualization, and `gsap: true` sheet options, see the [GSAP extension](../extensions/gsap.md).

## Time mode

Time mode is the default. You do not need to pass `sequenceMode` unless you are switching away from page mode.

```ts
const sheet = project.sheet('Main')
// equivalent: project.sheet('Main', { sequenceMode: 'time' })
```

Behaviour matches the rest of the manual:

- **`sheet.sequence.play()`**, **`pause()`**, and setting **`sequence.position`** in **seconds** drive the playhead.
- **`sheet.sequence.attachAudio()`** is supported ([Audio](./audio.md)).
- Sequence length and editing behave like a normal timeline ([Sequences](./sequences.md)).

Extensions such as `@unseenco/theatre-gsap` attach bridges in time mode so registered tweens follow the same playhead. See [GSAP extension — time mode](../extensions/gsap.md#quick-start-time-mode).

## Page mode

Page mode maps vertical scroll on a **scroller** to the sequence playhead. Studio scrubbing updates scroll position; scrolling the page updates the playhead.

```ts
import {getProject} from '@unseenco/theatre-core'

const sheet = getProject('My project').sheet('Main', {
  sequenceMode: 'page',
})
```

You can also call **`sheet.setSequenceMode('page')`** after the sheet exists.

### Runtime behaviour

- **`sequence.play()`** is disabled; scrub the playhead in Studio or scroll the page.
- Page scroll drives the playhead; scrubbing the playhead in Studio scrolls the page (not every programmatic position change scrolls the other way).
- **`sequence.attachAudio()`** is not supported in page mode.
- Clip or keyframe spans on the timeline use **percent** along the 0–100 axis, not seconds.

### Wiring scroll (`@unseenco/theatre-core`)

Page scroll does **not** require GSAP. Use the core APIs to choose which element scrolls and how progress is read and written.

**Shared scroller context** — call **`configureTheatrePageScroll()`** once so Studio and helpers know which element is the vertical scroller (`null` / omitted = document):

```ts
import {configureTheatrePageScroll} from '@unseenco/theatre-core'

configureTheatrePageScroll({scroller: document.documentElement})
```

**When creating the sheet** — pass **`scrollDriver`** on `project.sheet()`:

```ts
const sheet = project.sheet('Main', {
  sequenceMode: 'page',
  scrollDriver: myDriver,
})
```

**After creation** — **`attachTheatrePageScroll(sheet, { driver })`** or **`sheet.setPageScrollDriver(driver)`** (same underlying wiring as **`attachSheetScrollDriver`** used internally in page mode).

- **`sheet.setPageScrollDriver()`** / **`scrollDriver` on `project.sheet()`** keep Studio scrubbing in sync via **`syncPageScrollToSequencePosition`**.
- **`setPageScrollProgress(sheet, progress)`** / **`pageScrollProgressFromSequence(sheet)`** are optional when you only need normalized playhead progress.

If you omit a custom driver in page mode, Theatre uses a **native document** vertical scroll driver.

#### Lenis (recommended helper)

```ts
import {
  configureTheatrePageScroll,
  getProject,
} from '@unseenco/theatre-core'
import {createLenisScrollDriver} from '@unseenco/theatre-core/lenis'

configureTheatrePageScroll({scroller: document.documentElement})

const driver = createLenisScrollDriver(lenis)

const sheet = getProject('My project').sheet('Main', {
  sequenceMode: 'page',
  scrollDriver: driver,
})
```

#### Manual `ScrollDriver`

Implement **`ScrollDriver`** for any library (smooth scroll, custom physics, etc.):

```ts
import {
  attachTheatrePageScroll,
  configureTheatrePageScroll,
  type ScrollDriver,
} from '@unseenco/theatre-core'

configureTheatrePageScroll({scroller: document.documentElement})

const driver: ScrollDriver = {
  getProgress: () => lenis.scroll / lenis.limit,
  setProgress: (p) => lenis.scrollTo(p * lenis.limit, {immediate: true}),
  subscribe: (cb) => {
    const onScroll = () => cb(lenis.scroll / lenis.limit)
    lenis.on('scroll', onScroll)
    return () => lenis.off('scroll', onScroll)
  },
}

const sheet = project.sheet('Main', {sequenceMode: 'page', scrollDriver: driver})
// or: attachTheatrePageScroll(sheet, {driver})
```

#### Overflow element scroll (no Lenis)

For a scrollable **`HTMLElement`**, use **`createElementScrollDriver(element)`** with **`configureTheatrePageScroll({ scroller: element })`**.

### GSAP and page mode

To register GSAP tweens on a page-mode sheet, enable the GSAP bridge (`gsap: true` on the sheet or **`attachGsapSequenceBridge(sheet)`**) and set clip **`defaultDuration`** in **percent**. ScrollTrigger bars on the sequencer are GSAP-specific. See [GSAP extension — page mode](../extensions/gsap.md#page-mode-scroll-driven-sequence).

Playground demos (GSAP + page mode): **`/shared/gsap-page-mode/`** (native scroll), **`/shared/gsap-page-mode-lenis/`** (Lenis + custom driver). Run `yarn playground` and open the printed local URL.

## API

[`sequenceMode` / sheet options](/api/theatre-core), [`configureTheatrePageScroll`](/api/theatre-core), [`attachTheatrePageScroll`](/api/theatre-core), [`ScrollDriver`](/api/theatre-core). Lenis helper: import `createLenisScrollDriver` from `@unseenco/theatre-core/lenis` (see package `exports` in [@unseenco/theatre-core](/api/theatre-core)).
