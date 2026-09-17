import {gsapClipSyncProgress} from '@unseenco/theatre-shared/sequence/trackData'
import {getAnimationEntryById} from './gsapAnimationRegistry'

export type GsapClipTiming = {
  gsapAnimationId: string
  start: number
  duration: number
}

/** Updates registered GSAP tween progress for each clip at `sequencePosition`. */
export function syncRegisteredGsapAnimationsForClips(
  sequencePosition: number,
  clips: ReadonlyArray<GsapClipTiming>,
): void {
  for (const clip of clips) {
    const progress = gsapClipSyncProgress(sequencePosition, clip)
    if (progress === null) continue
    const entry = getAnimationEntryById(clip.gsapAnimationId)
    if (!entry?.animation) continue
    const animation = entry.animation as {
      progress: (progress: number, suppressEvents?: boolean) => void
    }
    animation.progress(progress, true)
  }
}

export function readGsapTweenTimelineDuration(animation: unknown): number {
  const tween = animation as {
    duration: () => number
    totalDuration?: () => number
  }
  const total = tween.totalDuration?.()
  if (typeof total === 'number' && total > 0) return total
  const d = tween.duration()
  return d > 0 ? d : 1
}
