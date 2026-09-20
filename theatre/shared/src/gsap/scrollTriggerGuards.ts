import {readGsapTweenTimelineDuration} from './syncGsapClipProgress'
import {
  defaultPageScrollContext,
  isVerticalPageScrollTrigger,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'

export type GsapScrollTriggerSurface = {
  start: number
  end: number
  horizontal?: boolean
  scroller?: unknown
  trigger?: unknown
  animation?: unknown
  vars?: {
    id?: string
    animation?: unknown
    horizontal?: boolean
    scroller?: unknown
  }
}

function isWindowLike(value: unknown): boolean {
  return (
    typeof Window !== 'undefined' &&
    (value === window || value instanceof Window)
  )
}

/** @internal */
export function isDocumentScroller(value: unknown): boolean {
  if (value == null) return true
  if (isWindowLike(value)) return true
  if (typeof document === 'undefined') return false
  return value === document.documentElement || value === document.body
}

/** True when ST uses default document vertical scroll (page-mode sync target). */
export function isDocumentVerticalScrollTrigger(st: unknown): boolean {
  return isVerticalPageScrollTrigger(st, defaultPageScrollContext)
}

export function resolveScrollTriggerAnimation(
  st: unknown,
): unknown | undefined {
  const surface = st as GsapScrollTriggerSurface
  if (surface.animation != null) return surface.animation
  if (surface.vars?.animation != null) return surface.vars.animation
  return undefined
}

export function defaultScrollTriggerLabel(
  st: unknown,
  fallbackIndex: number,
): string {
  const surface = st as GsapScrollTriggerSurface
  const id = surface.vars?.id
  if (typeof id === 'string' && id.length > 0) return id
  const trigger = surface.trigger
  if (trigger && typeof trigger === 'object' && 'id' in trigger) {
    const elementId = (trigger as {id?: string}).id
    if (typeof elementId === 'string' && elementId.length > 0) {
      return elementId
    }
  }
  return `ScrollTrigger ${fallbackIndex + 1}`
}

export function readAnimationSpanSeconds(animation: unknown): number {
  return Math.max(readGsapTweenTimelineDuration(animation), MIN_ANIMATION_SPAN)
}

const MIN_ANIMATION_SPAN = 0.01
