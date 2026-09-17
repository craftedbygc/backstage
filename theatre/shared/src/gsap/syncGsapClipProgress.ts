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

function pickActiveClipForTarget(
  group: EnrichedClip[],
  sequencePosition: number,
): EnrichedClip {
  const sorted = [...group].sort((a, b) => a.start - b.start)
  const started = sorted.filter((clip) => sequencePosition >= clip.start)
  if (started.length > 0) {
    return started[started.length - 1]!
  }
  return sorted[0]!
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
    const active = pickActiveClipForTarget(group, sequencePosition)
    const progress = gsapClipSyncProgress(sequencePosition, active)
    const animation = active.entry.animation as {
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
