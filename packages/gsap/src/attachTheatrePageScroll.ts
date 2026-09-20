import type {
  AttachTheatrePageScrollOptions,
  ISheet,
  PageScrollContext,
  PageScrollScroller,
  ScrollDriver,
} from '@unseenco/theatre-core'
import {
  attachTheatrePageScroll as attachTheatrePageScrollCore,
  createDefaultPageScrollDriver as createDefaultPageScrollDriverCore,
  getTheatrePageScrollContext as getTheatrePageScrollContextCore,
} from '@unseenco/theatre-core'
import {
  defaultPageScrollContext,
  setActivePageScrollContext,
} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {getTheatreGsapConfig} from './config'
import {getGsapScrollTriggerPlugin} from './gsapScrollTriggerPlugin'

function applyScrollTriggerDefaultsFromGsapConfig(): void {
  const {pageScroll} = getTheatreGsapConfig()
  if (!pageScroll) return
  const ScrollTrigger = getGsapScrollTriggerPlugin()
  if (!ScrollTrigger?.defaults) return
  ScrollTrigger.defaults({scroller: pageScroll.scroller ?? undefined})
}

export function getTheatrePageScrollContext(): PageScrollContext {
  applyScrollTriggerDefaultsFromGsapConfig()
  const pageScroll = getTheatreGsapConfig().pageScroll
  if (pageScroll) {
    const ctx = {
      scroller: pageScroll.scroller ?? defaultPageScrollContext.scroller,
    }
    setActivePageScrollContext(ctx)
    return ctx
  }
  return getTheatrePageScrollContextCore()
}

export function createDefaultPageScrollDriver(
  scroller: PageScrollScroller = getTheatrePageScrollContext().scroller,
): ScrollDriver {
  return createDefaultPageScrollDriverCore(scroller)
}

export type {AttachTheatrePageScrollOptions}

/**
 * @deprecated Import from `@unseenco/theatre-core` for page scroll without GSAP.
 * This wrapper applies ScrollTrigger defaults when `configureTheatreGsap({ pageScroll })` is used.
 */
export function attachTheatrePageScroll(
  sheet: ISheet,
  options: AttachTheatrePageScrollOptions = {},
): () => void {
  applyScrollTriggerDefaultsFromGsapConfig()
  return attachTheatrePageScrollCore(sheet, options)
}
