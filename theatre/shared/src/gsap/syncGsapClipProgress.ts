import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import {gsapClipSyncProgress} from '@unseenco/backstage-shared/sequence/trackData'
import {applyTimelineChildTimingToGsap} from './applyTimelineChildTiming'
import {getAnimationEntryBySheetAddressKey} from './gsapAnimationRegistry'
import type {GsapAnimationRegistryEntry} from './gsapAnimationRegistry'

export type GsapClipTiming = {
  /** From {@link sheetObjectAddressKey} / {@link sheetObjectAddressKeyFromParts}. */
  sheetObjectAddressKey: string
  gsapAnimationId: string
  start: number
  duration: number
  timelineChildren?: ReadonlyArray<GsapTimelineChildClip>
  timelineSpan?: number
}

type EnrichedClip = GsapClipTiming & {
  entry: GsapAnimationRegistryEntry
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
    const entry = getAnimationEntryBySheetAddressKey(
      clip.sheetObjectAddressKey,
      clip.gsapAnimationId,
    )
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
      const entry = clip.entry
      const animation = entry.animation as {
        progress?: (progress: number, suppressEvents?: boolean) => number
        time?: (time: number, suppressEvents?: boolean) => number
      }
      if (
        entry.kind === 'timeline' &&
        clip.timelineChildren &&
        clip.timelineChildren.length > 0
      ) {
        applyTimelineChildTimingToGsap(
          entry.animation,
          clip.timelineChildren,
          entry.timelineChildById,
          entry.onRebuildTimeline,
        )
        const span =
          clip.timelineSpan ?? readGsapTweenTimelineDuration(entry.animation)
        const t = progress * Math.max(span, 0.01)
        if (typeof animation.time === 'function') {
          animation.time(t, true)
        } else {
          animation.progress?.(progress, true)
        }
      } else {
        animation.progress?.(progress, true)
      }
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
