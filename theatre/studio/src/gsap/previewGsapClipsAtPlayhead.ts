import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {SequenceTrackId} from '@unseenco/theatre-shared/utils/ids'
import {val} from '@unseenco/theatre-dataverse'
import {syncGsapClipsAtSequencePosition} from '@unseenco/theatre-shared/gsap/syncGsapClipsAtSequencePosition'

export type GsapClipTimingOverride = {
  trackId: SequenceTrackId
  start: number
  duration: number
}

/** Re-applies GSAP clip progress at the current sequence playhead (e.g. after clip timing edits). */
export function previewGsapClipsAtCurrentPlayhead(
  sheetObject: SheetObject,
  clipOverride?: GsapClipTimingOverride,
): void {
  const sequence = sheetObject.sheet.publicApi.sequence
  const position = val(sequence.pointer.position)
  const clips = sequence
    .__experimental_getGsapClips()
    .map(({clip, trackId}) => {
      if (clipOverride && clipOverride.trackId === trackId) {
        return {
          gsapAnimationId: clip.gsapAnimationId,
          start: clipOverride.start,
          duration: clipOverride.duration,
          timelineChildren: clip.timelineChildren,
          timelineSpan: clip.timelineSpan,
        }
      }
      return {
        gsapAnimationId: clip.gsapAnimationId,
        start: clip.start,
        duration: clip.duration,
        timelineChildren: clip.timelineChildren,
        timelineSpan: clip.timelineSpan,
      }
    })
  syncGsapClipsAtSequencePosition(position, clips)
}
