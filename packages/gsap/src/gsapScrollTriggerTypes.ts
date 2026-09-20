/** Minimal GSAP ScrollTrigger surface for Theatre (avoids tight GSAP coupling). */
export type GsapScrollTriggerLike = {
  start: number
  end: number
  horizontal?: boolean
  scroller?: unknown
  trigger?: unknown
  animation?: unknown
  vars?: {
    id?: string
    animation?: unknown
    horizontal?: boolean
    scroller?: unknown
  }
}

export type GsapScrollTriggerStaticLike = {
  refresh(): void
  getAll(): GsapScrollTriggerLike[]
  defaults?(vars: {scroller?: unknown}): void
}
