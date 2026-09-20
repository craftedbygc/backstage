import type {
  AttachBackstagePageScrollOptions,
  ISheet,
  PageScrollContext,
  PageScrollScroller,
  ScrollDriver,
} from '@unseenco/backstage'
import {
  attachBackstagePageScroll as attachBackstagePageScrollCore,
  createDefaultPageScrollDriver as createDefaultPageScrollDriverCore,
  getBackstagePageScrollContext as getBackstagePageScrollContextCore,
} from '@unseenco/backstage'
import {
  defaultPageScrollContext,
  resolvePageScrollAxis,
  setActivePageScrollContext,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import {getBackstageGsapConfig} from './config'
import {getGsapScrollTriggerPlugin} from './gsapScrollTriggerPlugin'

function applyScrollTriggerDefaultsFromGsapConfig(): void {
  const {pageScroll} = getBackstageGsapConfig()
  if (!pageScroll) return
  const ScrollTrigger = getGsapScrollTriggerPlugin()
  if (!ScrollTrigger?.defaults) return
  const axis = pageScroll.axis ?? defaultPageScrollContext.axis ?? 'vertical'
  ScrollTrigger.defaults({
    scroller: pageScroll.scroller ?? undefined,
    ...(axis === 'horizontal' ? {horizontal: true} : {}),
  })
}

export function getBackstagePageScrollContext(): PageScrollContext {
  applyScrollTriggerDefaultsFromGsapConfig()
  const pageScroll = getBackstageGsapConfig().pageScroll
  if (pageScroll) {
    const ctx = {
      scroller: pageScroll.scroller ?? defaultPageScrollContext.scroller,
      axis: pageScroll.axis ?? defaultPageScrollContext.axis,
    }
    setActivePageScrollContext(ctx)
    return ctx
  }
  return getBackstagePageScrollContextCore()
}

export function createDefaultPageScrollDriver(
  scroller: PageScrollScroller = getBackstagePageScrollContext().scroller,
): ScrollDriver {
  const ctx = getBackstagePageScrollContext()
  return createDefaultPageScrollDriverCore(scroller, resolvePageScrollAxis(ctx))
}

export type {AttachBackstagePageScrollOptions}

/**
 * @deprecated Import from `@unseenco/backstage` for page scroll without GSAP.
 * This wrapper applies ScrollTrigger defaults when `configureBackstageGsap({ pageScroll })` is used.
 */
export function attachBackstagePageScroll(
  sheet: ISheet,
  options: AttachBackstagePageScrollOptions = {},
): () => void {
  applyScrollTriggerDefaultsFromGsapConfig()
  return attachBackstagePageScrollCore(sheet, options)
}
