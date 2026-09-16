import type {ISheet} from '@unseenco/theatre-core'
import {onChange} from '@unseenco/theatre-core'
import {syncRegisteredGsapAnimationsForClips} from '@unseenco/theatre-shared/gsap/syncGsapClipProgress'

/**
 * Drives registered GSAP animations from the sheet sequence playhead.
 *
 * @returns Disposer — call to detach the bridge.
 */
export function attachGsapSequenceBridge(sheet: ISheet): () => void {
  const sequence = sheet.sequence

  return onChange(sequence.pointer.position, (position) => {
    const clips = sequence.__experimental_getGsapClips().map(({clip}) => clip)
    syncRegisteredGsapAnimationsForClips(position, clips)
  })
}
