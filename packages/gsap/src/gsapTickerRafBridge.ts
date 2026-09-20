import type {IRafDriver} from '@unseenco/backstage'
import {getTheatreCoreRafDriver} from '@unseenco/backstage/privateAPIs'
import {getTheatreGsapConfig} from './config'

const gsapTickerDrivenDriverIds = new Set<number>()

export type GsapTickerLike = {
  ticker: {
    add(fn: (time: number) => void): unknown
    remove(fn: (time: number) => void): unknown
  }
}

/**
 * Drives a Theatre `rafDriver` from `gsap.ticker` (GSAP time in seconds → Theatre ms).
 * Returns a cleanup that removes the ticker listener and unmarks the driver.
 */
export function bindGsapTickerToRafDriver(
  rafDriver: IRafDriver,
  gsap: GsapTickerLike,
): () => void {
  const onTick = (time: number) => {
    rafDriver.tick(time * 1000)
  }
  gsapTickerDrivenDriverIds.add(rafDriver.id)
  gsap.ticker.add(onTick)
  return () => {
    gsap.ticker.remove(onTick)
    gsapTickerDrivenDriverIds.delete(rafDriver.id)
  }
}

export function isRafDriverDrivenByGsapTicker(rafDriver: IRafDriver): boolean {
  return gsapTickerDrivenDriverIds.has(rafDriver.id)
}

let hasWarnedGsapTickerRaf = false
let gsapTickerRafWarningMicrotaskQueued = false

/**
 * Schedules a deferred check so same-turn `setCoreRafDriver` → `bindGsapTickerToRafDriver`
 * → `registerGsapAnimation` does not warn before the bind runs.
 */
export function scheduleGsapTickerRafWarningCheck(): void {
  if (gsapTickerRafWarningMicrotaskQueued) return
  gsapTickerRafWarningMicrotaskQueued = true
  queueMicrotask(() => {
    gsapTickerRafWarningMicrotaskQueued = false
    warnIfGsapTickerNotDrivingTheatreRaf()
  })
}

/**
 * Warns once per page load when Theatre's core rAF is not driven by `gsap.ticker`.
 */
export function warnIfGsapTickerNotDrivingTheatreRaf(): void {
  if (typeof window === 'undefined') return
  if (getTheatreGsapConfig().suppressGsapTickerRafWarning) return
  if (hasWarnedGsapTickerRaf) return

  const coreDriver = getTheatreCoreRafDriver()
  if (!isRafDriverDrivenByGsapTicker(coreDriver)) {
    hasWarnedGsapTickerRaf = true
    console.warn(
      '[theatre-gsap] Theatre is not driven by gsap.ticker. After setCoreRafDriver(), call bindGsapTickerToRafDriver(rafDriver, gsap) so GSAP and Theatre share one clock. See the GSAP extension guide.',
    )
  }
}

/** @internal test-only */
export function resetGsapTickerRafBridgeForTests(): void {
  gsapTickerDrivenDriverIds.clear()
  hasWarnedGsapTickerRaf = false
  gsapTickerRafWarningMicrotaskQueued = false
}
