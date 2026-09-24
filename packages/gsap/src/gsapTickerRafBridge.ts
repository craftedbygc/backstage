import type {IRafDriver} from '@unseenco/backstage'
import {peekBackstageCoreRafDriver} from '@unseenco/backstage/privateAPIs'
import {getBackstageGsapConfig} from './config'

const gsapTickerDrivenDriverIds = new Set<number>()

export type GsapTickerLike = {
  ticker: {
    add(fn: (time: number) => void): unknown
    remove(fn: (time: number) => void): unknown
  }
}

/**
 * Drives a Backstage `rafDriver` from `gsap.ticker` (GSAP time in seconds → Backstage ms).
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
    warnIfGsapTickerNotDrivingBackstageRaf()
  })
}

/**
 * Warns once per page load when Backstage's core rAF is not driven by `gsap.ticker`.
 */
export function warnIfGsapTickerNotDrivingBackstageRaf(): void {
  if (typeof window === 'undefined') return
  if (getBackstageGsapConfig().suppressGsapTickerRafWarning) return
  if (hasWarnedGsapTickerRaf) return

  const coreDriver = peekBackstageCoreRafDriver()
  if (!coreDriver) return
  if (!isRafDriverDrivenByGsapTicker(coreDriver)) {
    hasWarnedGsapTickerRaf = true
    console.warn(
      '[backstage-gsap] Backstage is not driven by gsap.ticker. After setCoreRafDriver(), call bindGsapTickerToRafDriver(rafDriver, gsap) so GSAP and Backstage share one clock. See the GSAP extension guide.',
    )
  }
}

/** @internal test-only */
export function resetGsapTickerRafBridgeForTests(): void {
  gsapTickerDrivenDriverIds.clear()
  hasWarnedGsapTickerRaf = false
  gsapTickerRafWarningMicrotaskQueued = false
}
