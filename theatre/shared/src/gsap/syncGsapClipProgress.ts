import {gsapClipLocalProgress} from '@unseenco/theatre-shared/sequence/trackData'
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
    const entry = getAnimationEntryById(clip.gsapAnimationId)
    if (!entry?.animation) continue
    const animation = entry.animation as {
      progress: (progress: number, suppressEvents?: boolean) => void
    }
    animation.progress(gsapClipLocalProgress(sequencePosition, clip), true)
  }
}
