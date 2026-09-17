import type {ISheet} from '@unseenco/theatre-core'
import {subscribeGsapClipSyncAtPlayhead} from '@unseenco/theatre-shared/gsap/subscribeGsapClipSyncAtPlayhead'

/**
 * Drives registered GSAP animations from the sheet sequence playhead.
 *
 * @returns Disposer — call to detach the bridge.
 */
export function attachGsapSequenceBridge(sheet: ISheet): () => void {
  const sequence = sheet.sequence

  return subscribeGsapClipSyncAtPlayhead({
    pointer: sequence.pointer,
    getGsapClipTimings: () =>
      sequence.__experimental_getGsapClips().map(({clip}) => ({
        gsapAnimationId: clip.gsapAnimationId,
        start: clip.start,
        duration: clip.duration,
        timelineChildren: clip.timelineChildren,
        timelineSpan: clip.timelineSpan,
      })),
  })
}
