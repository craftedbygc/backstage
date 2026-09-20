import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import type {ISheet} from '@unseenco/theatre-core/sheets/TheatreSheet'
import {sheetObjectAddressKeyFromParts} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {subscribeGsapClipSyncAtPlayhead} from '@unseenco/backstage-shared/gsap/subscribeGsapClipSyncAtPlayhead'
import type {ObjectAddressKey} from '@unseenco/backstage-shared/utils/ids'

/**
 * Drives registered GSAP animations from the sheet sequence playhead.
 *
 * @returns Disposer — call to detach the bridge.
 */
export function attachGsapSequenceBridge(sheet: ISheet): () => void {
  const sequence = sheet.sequence
  const sheetAddress = privateAPI(sheet).address

  return subscribeGsapClipSyncAtPlayhead({
    pointer: sequence.pointer,
    getGsapClipTimings: () =>
      sequence.__experimental_getGsapClips().map(({objectKey, clip}) => ({
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
      })),
  })
}
