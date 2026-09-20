import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {ObjectAddressKey, SequenceTrackId} from '@unseenco/backstage-shared/utils/ids'
import {val} from '@unseenco/backstage/dataverse'
import {sheetObjectAddressKeyFromParts} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {syncGsapClipsAtSequencePosition} from '@unseenco/backstage-shared/gsap/syncGsapClipsAtSequencePosition'

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
    .map(({objectKey, clip, trackId}) => {
      const sheetObjectAddressKeyForClip = sheetObjectAddressKeyFromParts({
        ...sheetObject.address,
        objectKey: objectKey as ObjectAddressKey,
      })
      if (clipOverride && clipOverride.trackId === trackId) {
        return {
          sheetObjectAddressKey: sheetObjectAddressKeyForClip,
          gsapAnimationId: clip.gsapAnimationId,
          start: clipOverride.start,
          duration: clipOverride.duration,
          timelineChildren: clip.timelineChildren,
          timelineSpan: clip.timelineSpan,
        }
      }
      return {
        sheetObjectAddressKey: sheetObjectAddressKeyForClip,
        gsapAnimationId: clip.gsapAnimationId,
        start: clip.start,
        duration: clip.duration,
        timelineChildren: clip.timelineChildren,
        timelineSpan: clip.timelineSpan,
      }
    })
  syncGsapClipsAtSequencePosition(position, clips)
}
