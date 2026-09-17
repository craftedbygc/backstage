import type {GsapClipTiming} from './syncGsapClipProgress'
import {syncRegisteredGsapAnimationsForClips} from './syncGsapClipProgress'

export type GsapClipTimingSource = {
  gsapAnimationId: string
  start: number
  duration: number
}

/** Drives registered GSAP tweens from sequence playhead + clip list. */
export function syncGsapClipsAtSequencePosition(
  position: number,
  clips: ReadonlyArray<GsapClipTimingSource>,
): void {
  syncRegisteredGsapAnimationsForClips(
    position,
    clips as ReadonlyArray<GsapClipTiming>,
  )
}
