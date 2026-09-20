/** Minimal GSAP tween surface used by Backstage (avoids tight coupling to GSAP's TS exports). */
export type GsapTweenLike = {
  pause(): void
  progress(value: number, suppressEvents?: boolean): number
  duration(): number
  totalDuration?(): number
  time?(value: number, suppressEvents?: boolean): number
  getChildren?(
    nested: boolean,
    tweens: boolean,
    timelines: boolean,
  ): GsapTweenLike[]
  startTime?(value?: number): number
}
