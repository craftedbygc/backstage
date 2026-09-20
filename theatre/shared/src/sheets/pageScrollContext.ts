import type {GsapScrollTriggerSurface} from '@unseenco/theatre-shared/gsap/scrollTriggerGuards'

/** `null` = native document vertical scroll (window / documentElement). */
export type PageScrollScroller = Window | Element | null

export type PageScrollContext = {
  scroller: PageScrollScroller
}

export const defaultPageScrollContext: PageScrollContext = {
  scroller: null,
}

let activePageScrollContext: PageScrollContext = defaultPageScrollContext

export function setActivePageScrollContext(context: PageScrollContext): void {
  activePageScrollContext = context
}

export function getActivePageScrollContext(): PageScrollContext {
  return activePageScrollContext
}

export function resolvePageScrollScroller(
  st: unknown,
  defaultsScroller?: PageScrollScroller,
): PageScrollScroller {
  const surface = st as GsapScrollTriggerSurface
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

/** Same scroller target for page-mode ST registration (reference equality or both native doc). */
export function pageScrollScrollersMatch(
  a: PageScrollScroller,
  b: PageScrollScroller,
): boolean {
  if (a === b) return true
  if (isNativeDocumentScroller(a) && isNativeDocumentScroller(b)) return true
  return false
}

export function isVerticalScrollTrigger(st: unknown): boolean {
  const surface = st as GsapScrollTriggerSurface
  if (surface.horizontal === true || surface.vars?.horizontal === true) {
    return false
  }
  return true
}

export function isVerticalPageScrollTrigger(
  st: unknown,
  context: PageScrollContext = defaultPageScrollContext,
): boolean {
  if (!isVerticalScrollTrigger(st)) return false
  const stScroller = resolvePageScrollScroller(st, context.scroller)
  return pageScrollScrollersMatch(stScroller, context.scroller)
}
