import type {
  AttachTheatrePageScrollOptions,
  ISheet,
  PageScrollContext,
  PageScrollScroller,
  ScrollDriver,
} from '@unseenco/backstage'
import {
  attachTheatrePageScroll as attachTheatrePageScrollCore,
  createDefaultPageScrollDriver as createDefaultPageScrollDriverCore,
  getTheatrePageScrollContext as getTheatrePageScrollContextCore,
} from '@unseenco/backstage'
import {
  defaultPageScrollContext,
  resolvePageScrollAxis,
  setActivePageScrollContext,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import {getTheatreGsapConfig} from './config'
import {getGsapScrollTriggerPlugin} from './gsapScrollTriggerPlugin'

function applyScrollTriggerDefaultsFromGsapConfig(): void {
  const {pageScroll} = getTheatreGsapConfig()
  if (!pageScroll) return
  const ScrollTrigger = getGsapScrollTriggerPlugin()
  if (!ScrollTrigger?.defaults) return
  const axis = pageScroll.axis ?? defaultPageScrollContext.axis ?? 'vertical'
  ScrollTrigger.defaults({
    scroller: pageScroll.scroller ?? undefined,
    ...(axis === 'horizontal' ? {horizontal: true} : {}),
  })
}

export function getTheatrePageScrollContext(): PageScrollContext {
  applyScrollTriggerDefaultsFromGsapConfig()
  const pageScroll = getTheatreGsapConfig().pageScroll
  if (pageScroll) {
    const ctx = {
      scroller: pageScroll.scroller ?? defaultPageScrollContext.scroller,
      axis: pageScroll.axis ?? defaultPageScrollContext.axis,
    }
    setActivePageScrollContext(ctx)
    return ctx
  }
  return getTheatrePageScrollContextCore()
}

export function createDefaultPageScrollDriver(
  scroller: PageScrollScroller = getTheatrePageScrollContext().scroller,
): ScrollDriver {
  const ctx = getTheatrePageScrollContext()
  return createDefaultPageScrollDriverCore(scroller, resolvePageScrollAxis(ctx))
}

export type {AttachTheatrePageScrollOptions}

/**
 * @deprecated Import from `@unseenco/backstage` for page scroll without GSAP.
 * This wrapper applies ScrollTrigger defaults when `configureTheatreGsap({ pageScroll })` is used.
 */
export function attachTheatrePageScroll(
  sheet: ISheet,
  options: AttachTheatrePageScrollOptions = {},
): () => void {
  applyScrollTriggerDefaultsFromGsapConfig()
  return attachTheatrePageScrollCore(sheet, options)
}
