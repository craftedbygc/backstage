import type {Pointer} from '@unseenco/theatre-dataverse'
import {pointerToPrism, prism, val} from '@unseenco/theatre-dataverse'
import type {GsapClipTimingSource} from './syncGsapClipsAtSequencePosition'
import {syncGsapClipsAtSequencePosition} from './syncGsapClipsAtSequencePosition'

export type GsapClipSyncSequenceSource = {
  readonly pointer: {readonly position: Pointer<number>}
  getGsapClipTimings(): ReadonlyArray<GsapClipTimingSource>
}

/**
 * Keeps registered GSAP tweens aligned with the sequence playhead and clip list.
 * Uses `onStale` so scrub clicks apply synchronously (not only on the next tick).
 */
export function subscribeGsapClipSyncAtPlayhead(
  source: GsapClipSyncSequenceSource,
): () => void {
  const positionPointer = source.pointer.position
  const positionPrism = pointerToPrism(positionPointer)

  const clipsPrism = prism(() => source.getGsapClipTimings())

  const syncNow = () => {
    const clips = clipsPrism.getValue()
    if (clips.length === 0) return
    syncGsapClipsAtSequencePosition(val(positionPointer), clips)
  }

  const untapPosition = positionPrism.onStale(syncNow)
  const untapClips = clipsPrism.onStale(syncNow)

  syncNow()

  return () => {
    untapPosition()
    untapClips()
  }
}
