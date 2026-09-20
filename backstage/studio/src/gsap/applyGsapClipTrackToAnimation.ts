import type {GsapClipTrack} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {applyTimelineChildTimingToGsap} from '@unseenco/backstage-shared/gsap/applyTimelineChildTiming'
import {getAnimationEntry} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'

/** Pushes persisted clip child timing onto the registered GSAP timeline/tween. */
export function applyGsapClipTrackToAnimation(
  sheetObject: SheetObject,
  track: GsapClipTrack,
): void {
  const entry = getAnimationEntry(sheetObject, track.gsapAnimationId)
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
