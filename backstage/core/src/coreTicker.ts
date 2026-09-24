import type {Ticker} from '@unseenco/backstage/dataverse'
import {privateAPI} from './privateAPIs'
import type {IRafDriver, RafDriverPrivateAPI} from './rafDrivers'
import {createRafDriver} from './rafDrivers'

/**
 * Creates a rafDrive that uses `window.requestAnimationFrame` in browsers,
 * or a single `setTimeout` in SSR.
 */
function createBasicRafDriver(): IRafDriver {
  let rafId: number | null = null
  let running = false

  const onAnimationFrame = (t: number) => {
    if (!running) return
    driver.tick(t)
    rafId = window.requestAnimationFrame(onAnimationFrame)
  }

  const start = (): void => {
    if (running) return
    running = true
    if (typeof window !== 'undefined') {
      rafId = window.requestAnimationFrame(onAnimationFrame)
    } else {
      driver.tick(0)
      setTimeout(() => {
        if (running) driver.tick(1)
      }, 0)
    }
  }

  const stop = (): void => {
    running = false
    if (typeof window !== 'undefined') {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    }
  }

  const driver = createRafDriver({name: 'DefaultCoreRafDriver', start, stop})

  return driver
}

let coreRafDriver: RafDriverPrivateAPI | undefined

/**
 * Returns the rafDriver that is used by the core internally. Creates a new one if it's not set yet.
 */
export function getCoreRafDriver(): RafDriverPrivateAPI {
  if (!coreRafDriver) {
    setCoreRafDriver(createBasicRafDriver())
  }
  return coreRafDriver!
}

/**
 *
 * @returns The ticker that is used by the core internally.
 */
export function getCoreTicker(): Ticker {
  return getCoreRafDriver().ticker
}

/**
 * Sets the `rafDriver` that Backstage's core uses internally to tick forward.
 *
 * Call this **before** any other `@unseenco/backstage` API that would trigger tick creation
 * (e.g. `onChange`, `sequence.play`, `val`). Calling it after the core ticker has
 * already been initialised will throw.
 *
 * This is the recommended way to drive Backstage from your own
 * `requestAnimationFrame` loop — for example when integrating with
 * `gsap`, `lenis`, or an XR session:
 *
 * ```ts
 * import { createRafDriver, setCoreRafDriver } from '@unseenco/backstage'
 *
 * const driver = createRafDriver({ name: 'MyRafDriver' })
 * setCoreRafDriver(driver)
 *
 * function myLoop(time: number) {
 *   driver.tick(time)
 *   requestAnimationFrame(myLoop)
 * }
 * requestAnimationFrame(myLoop)
 * ```
 *
 * Because you hold the `driver` reference you created, you do not need a separate
 * `getCoreRafDriver()` call — just keep the reference around and call
 * `driver.tick(time)` from your loop.
 */
export function setCoreRafDriver(driver: IRafDriver) {
  if (coreRafDriver) {
    throw new Error(`\`setCoreRafDriver()\` is already called.`)
  }
  const driverPrivateApi = privateAPI(driver)
  coreRafDriver = driverPrivateApi
}

/**
 * Returns the core rAF driver if one has been created or set; otherwise `undefined`.
 * Unlike {@link getCoreRafDriver}, does not create the default driver.
 */
export function peekCoreRafDriver(): RafDriverPrivateAPI | undefined {
  return coreRafDriver
}

/** @internal Reset between unit tests. */
export function resetCoreRafDriverForTests(): void {
  coreRafDriver?.stop?.()
  coreRafDriver = undefined
}
