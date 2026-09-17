import type {GsapClipTrack} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {applyTimelineChildTimingToGsap} from '@unseenco/theatre-shared/gsap/applyTimelineChildTiming'
import {getAnimationEntryById} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'

/** Pushes persisted clip child timing onto the registered GSAP timeline/tween. */
export function applyGsapClipTrackToAnimation(
  sheetObject: SheetObject,
  track: GsapClipTrack,
): void {
  const entry = getAnimationEntryById(track.gsapAnimationId)
  if (!entry?.animation) return
  if (track.timelineChildren?.length) {
    applyTimelineChildTimingToGsap(
      entry.animation,
      track.timelineChildren,
      entry.timelineChildById,
      entry.onRebuildTimeline,
    )
  }
}
