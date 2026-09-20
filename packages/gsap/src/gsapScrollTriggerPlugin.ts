import {ScrollTrigger as scrollTriggerFromGsap} from 'gsap/ScrollTrigger'
import type {GsapScrollTriggerStaticLike} from './gsapScrollTriggerTypes'

let boundScrollTrigger: GsapScrollTriggerStaticLike | undefined

/**
 * Optional: bind the ScrollTrigger plugin instance your app registered with GSAP.
 * When omitted, Backstage resolves ScrollTrigger from `gsap/ScrollTrigger` (ESM) or `globalThis.ScrollTrigger`.
 */
export function bindGsapScrollTriggerPlugin(
  scrollTrigger: GsapScrollTriggerStaticLike,
): void {
  boundScrollTrigger = scrollTrigger
}

export function getGsapScrollTriggerPlugin():
  | GsapScrollTriggerStaticLike
  | undefined {
  if (boundScrollTrigger) {
    return boundScrollTrigger
  }
  const g = globalThis as typeof globalThis & {
    ScrollTrigger?: GsapScrollTriggerStaticLike
  }
  return (
    g.ScrollTrigger ??
    (scrollTriggerFromGsap as unknown as GsapScrollTriggerStaticLike)
  )
}

export function requireGsapScrollTriggerPlugin(): GsapScrollTriggerStaticLike {
  const plugin = getGsapScrollTriggerPlugin()
  if (!plugin) {
    throw new Error(
      'ScrollTrigger is not available. Import ScrollTrigger from "gsap/ScrollTrigger", call gsap.registerPlugin(ScrollTrigger), and optionally bindGsapScrollTriggerPlugin(ScrollTrigger) before registering scroll triggers with Backstage.',
    )
  }
  return plugin
}

export function refreshGsapScrollTriggers(): void {
  getGsapScrollTriggerPlugin()?.refresh()
}
