import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'

export function isGsapTimeline(animation: unknown): boolean {
  const root = animation as {
    getChildren?: (
      nested: boolean,
      tweens: boolean,
      timelines: boolean,
    ) => unknown[]
  }
  const children = root.getChildren?.(false, true, false)
  return Array.isArray(children) && children.length > 0
}

function childLabel(child: unknown, index: number): string {
  const tween = child as {vars?: {id?: string}}
  const id = tween.vars?.id
  if (typeof id === 'string' && id.length > 0) return id
  return `Tween ${index + 1}`
}

function readChildLocalTiming(child: unknown): {
  localStart: number
  localDuration: number
} {
  const tween = child as {
    startTime?: () => number
    duration?: () => number
    endTime?: () => number
  }
  const localStart =
    typeof tween.startTime === 'function' ? tween.startTime() : 0
  let localDuration =
    typeof tween.duration === 'function' ? tween.duration() : 0
  if (localDuration <= 0 && typeof tween.endTime === 'function') {
    localDuration = Math.max(tween.endTime() - localStart, 0.01)
  }
  return {
    localStart: Math.max(localStart, 0),
    localDuration: Math.max(localDuration, 0.01),
  }
}

/** Snapshots direct child tweens of a GSAP timeline (one nesting level). */
export function introspectGsapTimelineChildren(
  animation: unknown,
): GsapTimelineChildClip[] {
  if (!isGsapTimeline(animation)) return []
  const root = animation as {
    getChildren: (
      nested: boolean,
      tweens: boolean,
      timelines: boolean,
    ) => unknown[]
  }
  const raw = root.getChildren(false, true, false)
  return raw.map((child, index) => {
    const {localStart, localDuration} = readChildLocalTiming(child)
    return {
      childId: `child_${index}`,
      label: childLabel(child, index),
      localStart,
      localDuration,
    }
  })
}

/** Rebuilds runtime childId → tween map aligned with introspected ids. */
export function linkGsapTimelineChildAnimations(
  animation: unknown,
): Map<string, unknown> {
  const map = new Map<string, unknown>()
  if (!isGsapTimeline(animation)) return map
  const root = animation as {
    getChildren: (
      nested: boolean,
      tweens: boolean,
      timelines: boolean,
    ) => unknown[]
  }
  const raw = root.getChildren(false, true, false)
  raw.forEach((child, index) => {
    map.set(`child_${index}`, child)
  })
  return map
}
