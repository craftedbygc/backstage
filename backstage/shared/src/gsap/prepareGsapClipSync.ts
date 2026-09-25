import type {GsapTimelineChildClip} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import {gsapClipSyncProgress} from '@unseenco/backstage-shared/sequence/trackData'
import {applyTimelineChildTimingToGsap} from './applyTimelineChildTiming'
import {getAnimationEntryBySheetAddressKey} from './gsapAnimationRegistry'
import type {GsapAnimationRegistryEntry} from './gsapAnimationRegistry'
import type {GsapClipTiming} from './syncGsapClipProgress'

export type PreparedGsapClipSyncItem = {
  readonly clipKey: string
  readonly timing: GsapClipTiming
}

export type PreparedGsapClipSyncGroup = {
  readonly targetKey: unknown
  readonly items: ReadonlyArray<PreparedGsapClipSyncItem>
}

function clipSyncKey(timing: GsapClipTiming): string {
  return `${timing.sheetObjectAddressKey}\0${timing.gsapAnimationId}`
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

function timelineChildTimingSignature(
  children: ReadonlyArray<GsapTimelineChildClip> | undefined,
): string {
  if (!children?.length) return ''
  return children
    .map((c) => `${c.childId}:${c.localStart}:${c.localDuration}`)
    .join('|')
}

/** Groups registered clips by GSAP target; sorted by clip start within each group. */
export function prepareGsapClipSyncGroups(
  clips: ReadonlyArray<GsapClipTiming>,
): PreparedGsapClipSyncGroup[] {
  type Enriched = GsapClipTiming & {targetKey: unknown}
  const enriched: Enriched[] = []
  for (const clip of clips) {
    const entry = getAnimationEntryBySheetAddressKey(
      clip.sheetObjectAddressKey,
      clip.gsapAnimationId,
    )
    if (!entry?.animation) continue
    enriched.push({
      ...clip,
      targetKey: getGsapAnimationTargetKey(
        entry.animation,
        clip.gsapAnimationId,
      ),
    })
  }

  const byTarget = new Map<unknown, PreparedGsapClipSyncItem[]>()
  for (const item of enriched) {
    const list = byTarget.get(item.targetKey) ?? []
    list.push({
      clipKey: clipSyncKey(item),
      timing: item,
    })
    byTarget.set(item.targetKey, list)
  }

  const groups: PreparedGsapClipSyncGroup[] = []
  for (const [targetKey, items] of byTarget) {
    groups.push({
      targetKey,
      items: [...items].sort((a, b) => a.timing.start - b.timing.start),
    })
  }
  return groups
}

export type GsapClipSyncFrameCache = {
  lastProgressByClipKey: Map<string, number>
  lastTimelineTimingSignatureByClipKey: Map<string, string>
  lastTimelineAnimationByClipKey: Map<string, unknown>
}

export function createGsapClipSyncFrameCache(): GsapClipSyncFrameCache {
  return {
    lastProgressByClipKey: new Map(),
    lastTimelineTimingSignatureByClipKey: new Map(),
    lastTimelineAnimationByClipKey: new Map(),
  }
}

function applyTimelineTimingIfNeeded(
  entry: GsapAnimationRegistryEntry,
  clip: GsapClipTiming,
  cache: GsapClipSyncFrameCache,
): void {
  if (entry.kind !== 'timeline' || !clip.timelineChildren?.length) {
    return
  }

  const clipKey = clipSyncKey(clip)
  const signature = timelineChildTimingSignature(clip.timelineChildren)
  const animation = entry.animation
  if (
    cache.lastTimelineTimingSignatureByClipKey.get(clipKey) === signature &&
    cache.lastTimelineAnimationByClipKey.get(clipKey) === animation
  ) {
    return
  }

  applyTimelineChildTimingToGsap(
    animation,
    clip.timelineChildren,
    entry.timelineChildById,
    entry.onRebuildTimeline,
  )
  cache.lastTimelineTimingSignatureByClipKey.set(clipKey, signature)
  cache.lastTimelineAnimationByClipKey.set(clipKey, animation)
}

function applyClipProgress(
  sequencePosition: number,
  clip: GsapClipTiming,
  entry: GsapAnimationRegistryEntry,
): void {
  const progress = gsapClipSyncProgress(sequencePosition, clip)
  const animation = entry.animation as {
    progress?: (progress: number, suppressEvents?: boolean) => number
    time?: (time: number, suppressEvents?: boolean) => number
  }
  if (
    entry.kind === 'timeline' &&
    clip.timelineChildren &&
    clip.timelineChildren.length > 0
  ) {
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

/**
 * Applies playhead sync using a precomputed grouping. When `cache` is reused
 * across frames, unchanged same-target groups skip `progress()` / `time()`.
 */
export function syncPreparedGsapClipGroupsAtPosition(
  sequencePosition: number,
  groups: ReadonlyArray<PreparedGsapClipSyncGroup>,
  cache: GsapClipSyncFrameCache,
): void {
  for (const group of groups) {
    const progresses: number[] = []
    let groupUnchanged = group.items.length > 0

    for (const item of group.items) {
      const progress = gsapClipSyncProgress(sequencePosition, item.timing)
      progresses.push(progress)
      if (cache.lastProgressByClipKey.get(item.clipKey) !== progress) {
        groupUnchanged = false
      }
    }

    if (groupUnchanged) continue

    for (let i = 0; i < group.items.length; i++) {
      const item = group.items[i]!
      const entry = getAnimationEntryBySheetAddressKey(
        item.timing.sheetObjectAddressKey,
        item.timing.gsapAnimationId,
      )
      if (!entry?.animation) continue

      applyTimelineTimingIfNeeded(entry, item.timing, cache)
      applyClipProgress(sequencePosition, item.timing, entry)
      cache.lastProgressByClipKey.set(item.clipKey, progresses[i]!)
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
