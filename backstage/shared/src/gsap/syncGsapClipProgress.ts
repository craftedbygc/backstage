import type {GsapTimelineChildClip} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import {
  createGsapClipSyncFrameCache,
  prepareGsapClipSyncGroups,
  syncPreparedGsapClipGroupsAtPosition,
} from './prepareGsapClipSync'

export type GsapClipTiming = {
  /** From {@link sheetObjectAddressKey} / {@link sheetObjectAddressKeyFromParts}. */
  sheetObjectAddressKey: string
  gsapAnimationId: string
  start: number
  duration: number
  timelineChildren?: ReadonlyArray<GsapTimelineChildClip>
  timelineSpan?: number
}

/** Updates registered GSAP tween progress for each clip at `sequencePosition`. */
export function syncRegisteredGsapAnimationsForClips(
  sequencePosition: number,
  clips: ReadonlyArray<GsapClipTiming>,
): void {
  const groups = prepareGsapClipSyncGroups(clips)
  syncPreparedGsapClipGroupsAtPosition(
    sequencePosition,
    groups,
    createGsapClipSyncFrameCache(),
  )
}

export {readGsapTweenTimelineDuration} from './prepareGsapClipSync'
