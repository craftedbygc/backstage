import {gsapClipSyncProgress} from '@unseenco/theatre-shared/sequence/trackData'
import {getAnimationEntryById} from './gsapAnimationRegistry'

export type GsapClipTiming = {
  gsapAnimationId: string
  start: number
  duration: number
}

type EnrichedClip = GsapClipTiming & {
  entry: NonNullable<ReturnType<typeof getAnimationEntryById>>
  targetKey: unknown
}

function getGsapAnimationTargetKey(
  animation: unknown,
  fallbackAnimationId: string,
): unknown {
  const tween = animation as {targets?: () => unknown[]}
  const targets = tween.targets?.()
  if (targets && targets.length > 0) {
    return targets[0]
  }
  return fallbackAnimationId
}

/** Updates registered GSAP tween progress for each clip at `sequencePosition`. */
export function syncRegisteredGsapAnimationsForClips(
  sequencePosition: number,
  clips: ReadonlyArray<GsapClipTiming>,
): void {
  const enriched: EnrichedClip[] = []
  for (const clip of clips) {
    const entry = getAnimationEntryById(clip.gsapAnimationId)
    if (!entry?.animation) continue
    enriched.push({
      ...clip,
      entry,
      targetKey: getGsapAnimationTargetKey(
        entry.animation,
        clip.gsapAnimationId,
      ),
    })
  }

  const byTarget = new Map<unknown, EnrichedClip[]>()
  for (const item of enriched) {
    const list = byTarget.get(item.targetKey) ?? []
    list.push(item)
    byTarget.set(item.targetKey, list)
  }

  for (const group of byTarget.values()) {
    const sorted = [...group].sort((a, b) => a.start - b.start)
    // Same-target clips often animate the same properties. Apply every clip's
    // progress in timeline order so a playhead jump cannot leave an earlier
    // tween at a stale partial progress that overrides a later clip.
    for (const clip of sorted) {
      const progress = gsapClipSyncProgress(sequencePosition, clip)
      const animation = clip.entry.animation as {
        progress: (progress: number, suppressEvents?: boolean) => void
      }
      animation.progress(progress, true)
    }
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
