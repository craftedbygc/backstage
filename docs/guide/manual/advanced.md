# Advanced uses

## rafDrivers

A **raf driver** controls when Theatre advances time. The default driver uses `requestAnimationFrame`. Custom drivers help you:

- Share one animation loop with GSAP, Lenis, or `@react-three/fiber`
- Use `xr.requestAnimationFrame` in WebXR
- Step time manually (offline rendering, tests)

```ts
import {createRafDriver, onChange} from '@unseenco/theatre-core'

const rafDriver = createRafDriver({name: '5fps driver'})

setInterval(() => {
  rafDriver.tick(performance.now())
}, 200)

onChange(
  obj.props,
  (values) => {
    /* runs at most ~5Hz */
  },
  rafDriver,
)

sheet.sequence.play({rafDriver})
```

Optional `start` / `stop` hooks let Theatre start and stop your loop when nothing needs updating.

### Core ticker

To drive **all** core time advancement (not just one sequence or `onChange` subscription) from your loop, call **`setCoreRafDriver()`** once at startup:

```ts
import {createRafDriver, setCoreRafDriver} from '@unseenco/theatre-core'

const driver = createRafDriver({name: 'app loop'})
setCoreRafDriver(driver)

// Your render loop:
function frame(now: number) {
  driver.tick(now)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
```

Can only be set once per page load.

### Studio

```ts
studio.initialize({
  __experimental_rafDriver: rafDriver,
})
```

Use only when you intentionally want Studio UI ticks on the same driver.

## Non-undoable transactions

Persist Studio edits without adding an undo step:

```ts
studio.transaction(() => {
  // bulk import or programmatic tweaks
}, {undoable: false})
```

## Runtime lifecycle

List, detach, or unload sheets and objects without clearing saved project JSON—see [Runtime lifecycle](./runtime-lifecycle.md).

## API

[`createRafDriver`](/api/theatre-core), [`onChange`](/api/theatre-core)

> **Note:** Legacy docs described `RafDriverProvider` from `@theatre/r3f`. That package is not part of this fork; pass `rafDriver` into `onChange` and `sequence.play()` instead.
