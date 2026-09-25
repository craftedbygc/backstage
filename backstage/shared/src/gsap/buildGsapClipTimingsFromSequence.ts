import {sheetObjectAddressKeyFromParts} from './gsapAnimationRegistry'
import type {GsapClipTimingSource} from './syncGsapClipsAtSequencePosition'
import type {ObjectAddressKey} from '@unseenco/backstage-shared/utils/ids'
import type {SheetAddress} from '@unseenco/backstage-shared/utils/addresses'

export type GsapClipFromSequence = {
  objectKey: string
  clip: {
    gsapAnimationId: string
    start: number
    duration: number
    timelineChildren?: GsapClipTimingSource['timelineChildren']
    timelineSpan?: number
  }
}

/** Maps sequence GSAP clips to shared sync timings (includes timeline child fields). */
export function buildGsapClipTimingsFromSequence(
  sheetAddress: SheetAddress,
  clips: ReadonlyArray<GsapClipFromSequence>,
): ReadonlyArray<GsapClipTimingSource> {
  return clips.map(({objectKey, clip}) => ({
    sheetObjectAddressKey: sheetObjectAddressKeyFromParts({
      projectId: sheetAddress.projectId,
      sheetId: sheetAddress.sheetId,
      sheetInstanceId: sheetAddress.sheetInstanceId,
      objectKey: objectKey as ObjectAddressKey,
    }),
    gsapAnimationId: clip.gsapAnimationId,
    start: clip.start,
    duration: clip.duration,
    timelineChildren: clip.timelineChildren,
    timelineSpan: clip.timelineSpan,
  }))
}
