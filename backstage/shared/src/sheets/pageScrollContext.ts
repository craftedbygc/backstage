/** `null` = native document scroll (window / documentElement). */
export type PageScrollScroller = Window | Element | null

export type PageScrollAxis = 'vertical' | 'horizontal'

export type PageScrollContext = {
  scroller: PageScrollScroller
  /** Scroll axis for page mode and ScrollTrigger registration (default vertical). */
  axis?: PageScrollAxis
}

export const defaultPageScrollContext: PageScrollContext = {
  scroller: null,
  axis: 'vertical',
}

let activePageScrollContext: PageScrollContext = defaultPageScrollContext

export function setActivePageScrollContext(context: PageScrollContext): void {
  activePageScrollContext = {
    scroller: context.scroller,
    axis: context.axis ?? 'vertical',
  }
}

export function getActivePageScrollContext(): PageScrollContext {
  return activePageScrollContext
}

export function resolvePageScrollAxis(
  context: PageScrollContext = defaultPageScrollContext,
): PageScrollAxis {
  return context.axis ?? 'vertical'
}

export function resolvePageScrollScroller(
  st: unknown,
  defaultsScroller?: PageScrollScroller,
): PageScrollScroller {
  const surface = st as {
    scroller?: unknown
    vars?: {scroller?: unknown}
  }
  const fromSt = surface.scroller ?? surface.vars?.scroller
  if (fromSt != null) {
    return fromSt as PageScrollScroller
  }
  if (defaultsScroller !== undefined) {
    return defaultsScroller
  }
  return null
}

function isWindowLike(value: unknown): boolean {
  return (
    typeof Window !== 'undefined' &&
    (value === window || value instanceof Window)
  )
}

export function isNativeDocumentScroller(
  scroller: PageScrollScroller,
): boolean {
  if (scroller == null) return true
  if (isWindowLike(scroller)) return true
  if (typeof document === 'undefined') return false
  return scroller === document.documentElement || scroller === document.body
}

/** Same scroller target for page-mode scroll registration (reference equality or both native doc). */
export function pageScrollScrollersMatch(
  a: PageScrollScroller,
  b: PageScrollScroller,
): boolean {
  if (a === b) return true
  if (isNativeDocumentScroller(a) && isNativeDocumentScroller(b)) return true
  return false
}

export function isScrollTriggerHorizontal(st: unknown): boolean {
  const surface = st as {horizontal?: boolean; vars?: {horizontal?: boolean}}
  return surface.horizontal === true || surface.vars?.horizontal === true
}

/** @deprecated Use {@link isPageScrollTrigger} with context axis. */
export function isVerticalScrollTrigger(st: unknown): boolean {
  return !isScrollTriggerHorizontal(st)
}

/**
 * True when ST scroller and horizontal flag match the configured page scroll context.
 */
export function isPageScrollTrigger(
  st: unknown,
  context: PageScrollContext = defaultPageScrollContext,
): boolean {
  const axis = resolvePageScrollAxis(context)
  const stHorizontal = isScrollTriggerHorizontal(st)
  if (stHorizontal !== (axis === 'horizontal')) {
    return false
  }
  const stScroller = resolvePageScrollScroller(st, context.scroller)
  return pageScrollScrollersMatch(stScroller, context.scroller)
}

export function isVerticalPageScrollTrigger(
  st: unknown,
  context: PageScrollContext = defaultPageScrollContext,
): boolean {
  return isPageScrollTrigger(st, {
    scroller: context.scroller,
    axis: 'vertical',
  })
}
