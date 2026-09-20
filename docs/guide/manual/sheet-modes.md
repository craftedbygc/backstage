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

Extensions such as `@unseenco/backstage/gsap` attach bridges in time mode so registered tweens follow the same playhead. See [GSAP extension — time mode](../extensions/gsap.md#quick-start-time-mode).

## Page mode

Page mode maps scroll on a **scroller** (vertical or horizontal) to the sequence playhead. Studio scrubbing updates scroll position; scrolling the page updates the playhead.

```ts
import {getProject} from '@unseenco/backstage'

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

### Wiring scroll (`@unseenco/backstage`)

Page scroll does **not** require GSAP. Use the core APIs to choose which element scrolls and how progress is read and written.

**Shared scroller context** — call **`configureBackstagePageScroll()`** once so Studio and helpers know which element scrolls and which axis is active (`null` / omitted scroller = document; default axis = vertical):

```ts
import {configureBackstagePageScroll} from '@unseenco/backstage'

configureBackstagePageScroll({scroller: document.documentElement})
// horizontal native document scroll:
configureBackstagePageScroll({axis: 'horizontal'})
```

**When creating the sheet** — pass **`scrollDriver`** on `project.sheet()`:

```ts
const sheet = project.sheet('Main', {
  sequenceMode: 'page',
  scrollDriver: myDriver,
})
```

**After creation** — **`attachBackstagePageScroll(sheet, { driver })`** or **`sheet.setPageScrollDriver(driver)`** (same underlying wiring as **`attachSheetScrollDriver`** used internally in page mode).

- **`sheet.setPageScrollDriver()`** / **`scrollDriver` on `project.sheet()`** keep Studio scrubbing in sync via **`syncPageScrollToSequencePosition`**.
- **`setPageScrollProgress(sheet, progress)`** / **`pageScrollProgressFromSequence(sheet)`** are optional when you only need normalized playhead progress.

If you omit a custom driver in page mode, Backstage uses a **native document** scroll driver matching the configured **axis** (`createNativeDocumentScrollDriver` or `createNativeDocumentHorizontalScrollDriver`).

#### Horizontal page scroll

Set **`axis: 'horizontal'`** on **`configureBackstagePageScroll`**. Use **`createNativeDocumentHorizontalScrollDriver()`** or **`createElementHorizontalScrollDriver(element)`** when passing a custom **`scrollDriver`**. Lenis helper remains vertical-only; build a manual **`ScrollDriver`** for horizontal smooth scroll if needed.

GSAP ScrollTrigger registration must use **`horizontal: true`** on each trigger (or `ScrollTrigger.defaults({ horizontal: true })` via **`configureBackstageGsap({ pageScroll: { axis: 'horizontal' } })`**). See [GSAP extension — ScrollTrigger](../extensions/gsap.md#scrolltrigger-page-mode-read-only-sequencer).

#### Lenis (recommended helper)

```ts
import {
  configureBackstagePageScroll,
  getProject,
} from '@unseenco/backstage'
import {createLenisScrollDriver} from '@unseenco/backstage/lenis'

configureBackstagePageScroll({scroller: document.documentElement})

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
  attachBackstagePageScroll,
  configureBackstagePageScroll,
  type ScrollDriver,
} from '@unseenco/backstage'

configureBackstagePageScroll({scroller: document.documentElement})

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
// or: attachBackstagePageScroll(sheet, {driver})
```

#### Overflow element scroll (no Lenis)

For a scrollable **`HTMLElement`**, use **`createElementScrollDriver(element)`** (vertical) or **`createElementHorizontalScrollDriver(element)`** with **`configureBackstagePageScroll({ scroller: element, axis })`**.

### GSAP and page mode

To register GSAP tweens on a page-mode sheet, enable the GSAP bridge (`gsap: true` on the sheet or **`attachGsapSequenceBridge(sheet)`**) and set clip **`defaultDuration`** in **percent**. ScrollTrigger bars on the sequencer are GSAP-specific. See [GSAP extension — page mode](../extensions/gsap.md#page-mode-scroll-driven-sequence).

Playground demos (GSAP + page mode): **`/shared/gsap-page-mode/`** (native vertical scroll), **`/shared/gsap-page-mode-horizontal/`** (native horizontal scroll + horizontal ScrollTrigger), **`/shared/gsap-page-mode-lenis/`** (Lenis + custom driver). Run `yarn playground` and open the printed local URL.

## API

[`sequenceMode` / sheet options](/api/backstage-core), [`configureBackstagePageScroll`](/api/backstage-core), [`attachBackstagePageScroll`](/api/backstage-core), [`ScrollDriver`](/api/backstage-core). Lenis helper: import `createLenisScrollDriver` from `@unseenco/backstage/lenis` (see package `exports` in [@unseenco/backstage](/api/backstage-core)).
