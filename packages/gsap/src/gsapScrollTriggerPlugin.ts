import type {GsapScrollTriggerStaticLike} from './gsapScrollTriggerTypes'

export function getGsapScrollTriggerPlugin():
  | GsapScrollTriggerStaticLike
  | undefined {
  const g = globalThis as typeof globalThis & {
    ScrollTrigger?: GsapScrollTriggerStaticLike
  }
  return g.ScrollTrigger
}

export function requireGsapScrollTriggerPlugin(): GsapScrollTriggerStaticLike {
  const plugin = getGsapScrollTriggerPlugin()
  if (!plugin) {
    throw new Error(
      'ScrollTrigger is not available. Import ScrollTrigger from "gsap/ScrollTrigger" and call gsap.registerPlugin(ScrollTrigger) before registering scroll triggers with Theatre.',
    )
  }
  return plugin
}

export function refreshGsapScrollTriggers(): void {
  getGsapScrollTriggerPlugin()?.refresh()
}
