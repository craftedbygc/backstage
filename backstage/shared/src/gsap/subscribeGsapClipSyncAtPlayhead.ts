import type {Pointer} from '@unseenco/backstage/dataverse'
import {pointerToPrism, prism, val} from '@unseenco/backstage/dataverse'
import {gsapStudioRegistryRevisionPointer} from './gsapStudioRegistryRevision'
import {
  createGsapClipSyncFrameCache,
  prepareGsapClipSyncGroups,
  syncPreparedGsapClipGroupsAtPosition,
} from './prepareGsapClipSync'
import type {GsapClipTimingSource} from './syncGsapClipsAtSequencePosition'

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

  const clipsPrism = prism(() => {
    val(gsapStudioRegistryRevisionPointer)
    return source.getGsapClipTimings()
  })

  const preparedPrism = prism(() => {
    const clips = clipsPrism.getValue()
    return prepareGsapClipSyncGroups(clips)
  })

  const frameCache = createGsapClipSyncFrameCache()

  const syncNow = () => {
    const groups = preparedPrism.getValue()
    if (groups.length === 0) return
    syncPreparedGsapClipGroupsAtPosition(
      val(positionPointer),
      groups,
      frameCache,
    )
  }

  const untapPosition = positionPrism.onStale(syncNow)
  const untapClips = clipsPrism.onStale(() => {
    frameCache.lastProgressByClipKey.clear()
    frameCache.lastTimelineTimingSignatureByClipKey.clear()
    frameCache.lastTimelineAnimationByClipKey.clear()
    syncNow()
  })

  syncNow()

  return () => {
    untapPosition()
    untapClips()
  }
}
