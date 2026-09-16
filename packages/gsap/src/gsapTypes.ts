/** Minimal GSAP tween surface used by Theatre (avoids tight coupling to GSAP's TS exports). */
export type GsapTweenLike = {
  pause(): void
  progress(value: number, suppressEvents?: boolean): number
  duration(): number
}
