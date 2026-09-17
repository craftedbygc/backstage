import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import {readGsapTweenTimelineDuration} from './syncGsapClipProgress'

export function applyTimelineChildTimingToGsap(
  rootAnimation: unknown,
  timelineChildren: ReadonlyArray<GsapTimelineChildClip>,
  childById: ReadonlyMap<string, unknown> | undefined,
  onRebuild?: () => unknown,
): boolean {
  if (!timelineChildren.length) return true
  let ok = applyTimelineChildTimingToGsapInner(
    rootAnimation,
    timelineChildren,
    childById,
  )
  if (!ok && onRebuild) {
    const rebuilt = onRebuild()
    if (rebuilt) {
      ok = applyTimelineChildTimingToGsapInner(
        rebuilt,
        timelineChildren,
        childById,
      )
    }
  }
  return ok
}

function applyTimelineChildTimingToGsapInner(
  rootAnimation: unknown,
  timelineChildren: ReadonlyArray<GsapTimelineChildClip>,
  childById: ReadonlyMap<string, unknown> | undefined,
): boolean {
  if (!childById || timelineChildren.length === 0) return true
  let ok = true
  for (const childState of timelineChildren) {
    const tween = childById.get(childState.childId)
    if (!tween) continue
    try {
      const t = tween as {
        startTime?: (time: number) => unknown
        duration?: (dur: number) => unknown
      }
      if (typeof t.startTime === 'function') {
        t.startTime(childState.localStart)
      }
      if (typeof t.duration === 'function') {
        t.duration(childState.localDuration)
      }
    } catch {
      ok = false
    }
  }
  return ok
}

/** Updates parent clip duration on the sequence to match GSAP timeline span. */
export function sequenceDurationForTimelineSpan(
  timelineSpanSeconds: number,
  currentClipDuration: number,
): number {
  const span = Math.max(timelineSpanSeconds, 0.01)
  return Math.max(currentClipDuration, span)
}

export function readTimelineSpanSeconds(
  rootAnimation: unknown,
  fallback: number,
): number {
  const total = readGsapTweenTimelineDuration(rootAnimation)
  return total > 0 ? total : fallback
}
