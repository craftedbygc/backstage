import type {
  GsapClipBaselineTiming,
  GsapClipTrack,
  GsapTimelineChildClip,
} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {GsapAnimationRegistryEntry} from './gsapAnimationRegistry'
import {introspectGsapTimelineChildren} from './introspectGsapTimelineChildren'
import {readGsapTweenTimelineDuration} from './syncGsapClipProgress'

function cloneTimelineChildren(
  children: GsapTimelineChildClip[],
): GsapTimelineChildClip[] {
  return children.map((c) => ({...c}))
}

export function buildGsapClipBaselineTiming(p: {
  duration: number
  timelineSpan?: number
  timelineChildren?: GsapTimelineChildClip[]
}): GsapClipBaselineTiming {
  const duration = Math.max(p.duration, 0.01)
  const baseline: GsapClipBaselineTiming = {duration}
  if (p.timelineChildren && p.timelineChildren.length > 0) {
    baseline.timelineSpan = p.timelineSpan ?? duration
    baseline.timelineChildren = cloneTimelineChildren(p.timelineChildren)
  }
  return baseline
}

export function baselineTimingFromRegistryEntry(
  entry: GsapAnimationRegistryEntry,
): GsapClipBaselineTiming | undefined {
  if (entry.originalTiming) {
    return {
      duration: entry.originalTiming.duration,
      timelineSpan: entry.originalTiming.timelineSpan,
      timelineChildren: entry.originalTiming.timelineChildren
        ? cloneTimelineChildren(entry.originalTiming.timelineChildren)
        : undefined,
    }
  }
  if (!entry.animation) return undefined
  const duration =
    entry.defaultDuration ?? readGsapTweenTimelineDuration(entry.animation)
  const timelineChildren = introspectGsapTimelineChildren(entry.animation)
  if (timelineChildren.length > 0) {
    return buildGsapClipBaselineTiming({
      duration,
      timelineSpan: readGsapTweenTimelineDuration(entry.animation),
      timelineChildren,
    })
  }
  return buildGsapClipBaselineTiming({duration})
}

export function resolveGsapClipBaselineTiming(
  track: GsapClipTrack,
  entry?: GsapAnimationRegistryEntry,
): GsapClipBaselineTiming | undefined {
  if (track.baselineTiming) {
    return buildGsapClipBaselineTiming(track.baselineTiming)
  }
  if (entry) {
    return baselineTimingFromRegistryEntry(entry)
  }
  return undefined
}

/** Restores sequence clip timing from baseline; does not change {@link GsapClipTrack.start}. */
export function applyGsapClipBaselineToTrack(
  track: GsapClipTrack,
  baseline: GsapClipBaselineTiming,
): void {
  track.duration = Math.max(baseline.duration, 0.01)
  if (baseline.timelineChildren && baseline.timelineChildren.length > 0) {
    track.timelineChildren = cloneTimelineChildren(baseline.timelineChildren)
    track.timelineSpan = Math.max(
      baseline.timelineSpan ?? baseline.duration,
      0.01,
    )
  } else {
    delete track.timelineChildren
    delete track.timelineSpan
  }
}

export function applyGsapTimelineChildBaselineToTrack(
  track: GsapClipTrack,
  childId: string,
  baseline: GsapClipBaselineTiming,
): boolean {
  const baselineChild = baseline.timelineChildren?.find(
    (c) => c.childId === childId,
  )
  if (!baselineChild || !track.timelineChildren?.length) return false
  const child = track.timelineChildren.find((c) => c.childId === childId)
  if (!child) return false
  child.localStart = baselineChild.localStart
  child.localDuration = baselineChild.localDuration
  return true
}
