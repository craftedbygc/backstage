import {sheetObjectAddressKeyFromParts} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import type {ObjectAddressKey} from '@unseenco/theatre-shared/utils/ids'
import {privateAPI} from '../privateAPIs'
import type {ISheet} from '../sheets/TheatreSheet'
import {subscribeGsapClipSyncAtPlayhead} from './subscribeGsapClipSyncAtPlayhead'

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
