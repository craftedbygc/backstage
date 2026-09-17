import type {ISheet} from '@unseenco/theatre-core'
import {onChange} from '@unseenco/theatre-core'
import {syncGsapClipsAtSequencePosition} from '@unseenco/theatre-shared/gsap/syncGsapClipsAtSequencePosition'

/**
 * Drives registered GSAP animations from the sheet sequence playhead.
 *
 * @returns Disposer — call to detach the bridge.
 */
export function attachGsapSequenceBridge(sheet: ISheet): () => void {
  const sequence = sheet.sequence

  const syncAt = (position: number) => {
    const clips = sequence.__experimental_getGsapClips().map(({clip}) => ({
      gsapAnimationId: clip.gsapAnimationId,
      start: clip.start,
      duration: clip.duration,
    }))
    syncGsapClipsAtSequencePosition(position, clips)
  }

  return onChange(sequence.pointer.position, syncAt)
}
