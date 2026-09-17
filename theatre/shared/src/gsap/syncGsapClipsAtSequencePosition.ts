import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {GsapClipTiming} from './syncGsapClipProgress'
import {syncRegisteredGsapAnimationsForClips} from './syncGsapClipProgress'

export type GsapClipTimingSource = {
  sheetObjectAddressKey: string
  gsapAnimationId: string
  start: number
  duration: number
  timelineChildren?: ReadonlyArray<GsapTimelineChildClip>
  timelineSpan?: number
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
