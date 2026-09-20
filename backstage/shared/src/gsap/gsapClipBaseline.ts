import type {
  GsapClipBaselineTiming,
  GsapClipTrack,
  GsapTimelineChildClip,
} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
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

function baselineDurationSeconds(duration: number): number {
  return Math.max(duration, 0.01)
}

function baselineTimelineSpanSeconds(baseline: GsapClipBaselineTiming): number {
  return Math.max(baseline.timelineSpan ?? baseline.duration, 0.01)
}

function trackTimelineSpanSeconds(track: GsapClipTrack): number {
  return Math.max(track.timelineSpan ?? track.duration, 0.01)
}

function timelineChildTimingMatches(
  trackChild: GsapTimelineChildClip,
  baselineChild: GsapTimelineChildClip,
): boolean {
  return (
    trackChild.localStart === baselineChild.localStart &&
    trackChild.localDuration === baselineChild.localDuration
  )
}

/** True when clip duration / timeline span / child local timing differs from baseline. */
export function gsapClipTimingDeviatesFromBaseline(
  track: GsapClipTrack,
  baseline: GsapClipBaselineTiming,
): boolean {
  if (
    track.duration !== baselineDurationSeconds(baseline.duration)
  ) {
    return true
  }

  const baselineChildren = baseline.timelineChildren
  const hasBaselineTimeline =
    baselineChildren !== undefined && baselineChildren.length > 0
  const trackChildren = track.timelineChildren
  const hasTrackTimeline =
    trackChildren !== undefined && trackChildren.length > 0

  if (hasBaselineTimeline !== hasTrackTimeline) {
    return true
  }

  if (!hasBaselineTimeline) {
    return false
  }

  if (trackTimelineSpanSeconds(track) !== baselineTimelineSpanSeconds(baseline)) {
    return true
  }

  for (const baselineChild of baselineChildren!) {
    const trackChild = trackChildren!.find(
      (c) => c.childId === baselineChild.childId,
    )
    if (!trackChild || !timelineChildTimingMatches(trackChild, baselineChild)) {
      return true
    }
  }

  return false
}

/** True when the given child's local timing differs from baseline for that child. */
export function gsapTimelineChildTimingDeviatesFromBaseline(
  track: GsapClipTrack,
  childId: string,
  baseline: GsapClipBaselineTiming,
): boolean {
  const baselineChild = baseline.timelineChildren?.find(
    (c) => c.childId === childId,
  )
  const trackChild = track.timelineChildren?.find((c) => c.childId === childId)
  if (!baselineChild || !trackChild) {
    return false
  }
  return !timelineChildTimingMatches(trackChild, baselineChild)
}

export function gsapClipDeviatesFromBaseline(
  track: GsapClipTrack,
  entry?: GsapAnimationRegistryEntry,
): boolean {
  const baseline = resolveGsapClipBaselineTiming(track, entry)
  if (!baseline) return false
  return gsapClipTimingDeviatesFromBaseline(track, baseline)
}

export function gsapTimelineChildDeviatesFromBaseline(
  track: GsapClipTrack,
  childId: string,
  entry?: GsapAnimationRegistryEntry,
): boolean {
  const baseline = resolveGsapClipBaselineTiming(track, entry)
  if (!baseline) return false
  return gsapTimelineChildTimingDeviatesFromBaseline(track, childId, baseline)
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
