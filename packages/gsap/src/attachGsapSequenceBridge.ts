import type {ISheet} from '@unseenco/theatre-core'
import {onChange} from '@unseenco/theatre-core'
import {gsapClipLocalProgress} from '@unseenco/theatre-shared/sequence/trackData'
import {getAnimationEntryById} from './animationRegistry'

/**
 * Drives registered GSAP animations from the sheet sequence playhead.
 *
 * @returns Disposer — call to detach the bridge.
 */
export function attachGsapSequenceBridge(sheet: ISheet): () => void {
  const sequence = sheet.sequence

  return onChange(sequence.pointer.position, (position) => {
    const clips = sequence.__experimental_getGsapClips()
    for (const {clip} of clips) {
      const entry = getAnimationEntryById(clip.gsapAnimationId)
      if (!entry) continue
      const progress = gsapClipLocalProgress(position, clip)
      entry.animation.progress(progress, true)
    }
  })
}
