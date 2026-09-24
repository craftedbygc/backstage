import {Ticker} from '@unseenco/backstage/dataverse'
import {setPrivateAPI} from './privateAPIs'

/** Public API for a custom requestAnimationFrame driver that advances Backstage's core ticker. */
export interface IRafDriver {
  /**
   * All raf derivers have have `driver.type === 'Backstage_RafDriver_PublicAPI'`
   */
  readonly type: 'Backstage_RafDriver_PublicAPI'
  /**
   * The name of the driver. This is used for debugging purposes.
   */
  name: string
  /**
   * The id of the driver. This is used for debugging purposes.
   * It's guaranteed to be unique.
   */
  id: number
  /**
   * This is called by the driver when it's time to tick forward.
   * The time param is of the same type returned by `performance.now()`.
   */
  tick: (time: number) => void
}

export interface RafDriverPrivateAPI {
  readonly type: 'Backstage_RafDriver_PrivateAPI'
  publicApi: IRafDriver
  ticker: Ticker
  start?: () => void
  stop?: () => void
}

let lastDriverId = 0

/**
 * Creates a custom raf driver.
 * `rafDriver`s allow you to control when and how often computations in Backstage tick forward. (raf stands for [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)).
 * The default `rafDriver` in Backstage creates a `raf` loop and ticks forward on each frame. You can create your own `rafDriver`, which enables the following use-cases:
 *
 * 1. When using Backstage.js alongside other animation libs (`gsap`/`lenis`/`etc`), you'd want all animation libs to use a single `raf` loop to keep the libraries in sync and also to get better performance.
 * 2. In XR sessions, you'd want Backstage to tick forward using [`xr.requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/XRSession/requestAnimationFrame).
 * 3. In some advanced cases, you'd just want to manually tick forward (many ticks per frame, or skipping many frames, etc). This is useful for recording an animation, rendering to a file, testing an animation, running benchmarks, etc.
 *
 * Here is how you'd create a custom `rafDriver`:
 *
 * ```js
 * import { createRafDriver } from '@unseenco/backstage'
 *
 * const rafDriver = createRafDriver({ name: 'a custom 5fps raf driver' })
 *
 * setInterval(() => {
 *   rafDriver.tick(performance.now())
 * }, 200)
 * ```
 *
 * Now, any time you set up an `onChange()` listener, pass your custom `rafDriver`:
 *
 * ```js
 * import { onChange } from '@unseenco/backstage'
 *
 * onChange(
 *   // let's say object is a Backstage object, the one returned from calling `sheet.object()`
 *   object.props,
 *   // this callback will now only be called at 5fps (and won't be called if there are no new values)
 *   // even if `sequence.play()` updates `object.props` at 60fps, this listener is called a maximum of 5fps
 *   (propValues) => {
 *     console.log(propValues)
 *   },
 *   rafDriver,
 * )
 *
 * // this will update the values of `object.props` at 60fps, but the listener above will still get called a maximum of 5fps
 * sheet.sequence.play()
 *
 * // we can also customize at what resolution the sequence's playhead moves forward
 * sheet.sequence.play({ rafDriver }) // the playhead will move forward at 5fps
 * ```
 *
 * You can optionally make studio use this `rafDriver`. This means the parts of the studio that tick based on raf, will now tick at 5fps. This is only useful if you're doing something crazy like running the studio (and not the core) in an XR frame.
 *
 * ```js
 * studio.initialize({
 *   __experimental_rafDriver: rafDriver,
 * })
 * ```
 *
 * `rafDriver`s can optionally provide a `start/stop` callback. Backstage will call `start()` when it actually has computations scheduled, and will call `stop` if there is nothing to update after a few ticks:
 *
 * ```js
 * import { createRafDriver } from '@unseenco/backstage'
 * import type { IRafDriver } from '@theare/core'
 *
 * function createBasicRafDriver(): IRafDriver {
 *   let rafId: number | null = null
 *   let running = false
 *   const onAnimationFrame = (t: number) => {
 *     if (!running) return
 *     driver.tick(t)
 *     rafId = window.requestAnimationFrame(onAnimationFrame)
 *   }
 *   const start = (): void => {
 *     if (running) return
 *     running = true
 *     if (typeof window !== 'undefined') {
 *       rafId = window.requestAnimationFrame(onAnimationFrame)
 *     } else {
 *       driver.tick(0)
 *       setTimeout(() => {
 *         if (running) driver.tick(1)
 *       }, 0)
 *     }
 *   }
 *
 *   const stop = (): void => {
 *     running = false
 *     if (typeof window !== 'undefined') {
 *       if (rafId !== null) {
 *         window.cancelAnimationFrame(rafId)
 *         rafId = null
 *       }
 *     }
 *   }
 *
 *   const driver = createRafDriver({ name: 'DefaultCoreRafDriver', start, stop })
 *
 *   return driver
 * }
 * ```
 */
export function createRafDriver(conf?: {
  name?: string
  start?: () => void
  stop?: () => void
}): IRafDriver {
  const tick = (time: number): void => {
    ticker.tick(time)
  }

  const ticker = new Ticker({
    onActive() {
      conf?.start?.()
    },
    onDormant() {
      conf?.stop?.()
    },
  })

  const driverPublicApi: IRafDriver = {
    tick,
    id: lastDriverId++,
    name: conf?.name ?? `CustomRafDriver-${lastDriverId}`,
    type: 'Backstage_RafDriver_PublicAPI',
  }

  const driverPrivateApi: RafDriverPrivateAPI = {
    type: 'Backstage_RafDriver_PrivateAPI',
    publicApi: driverPublicApi,
    ticker,
    start: conf?.start,
    stop: conf?.stop,
  }

  setPrivateAPI(driverPublicApi, driverPrivateApi)

  return driverPublicApi
}
