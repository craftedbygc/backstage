import type {ISheet} from '@unseenco/theatre-core/sheets/TheatreSheet'
import {
  createElementHorizontalScrollDriver,
  createElementScrollDriver,
  createNativeDocumentHorizontalScrollDriver,
  createNativeDocumentScrollDriver,
} from '@unseenco/theatre-core/sheets/attachSheetScrollDriver'
import type {ScrollDriver} from '@unseenco/theatre-core/sheets/attachSheetScrollDriver'
import {
  defaultPageScrollContext,
  isNativeDocumentScroller,
  resolvePageScrollAxis,
  setActivePageScrollContext,
} from '@unseenco/theatre-core/sheets/pageScrollContext'
import type {
  PageScrollAxis,
  PageScrollContext,
  PageScrollScroller,
} from '@unseenco/theatre-core/sheets/pageScrollContext'

export type TheatrePageScrollConfig = {
  /** Default scroller for page-mode layout helpers; `null` = native document. */
  scroller?: PageScrollScroller
  /** Scroll axis (default vertical). */
  axis?: PageScrollAxis
}

let pageScrollConfig: TheatrePageScrollConfig = {}

function buildPageScrollContextFromConfig(): PageScrollContext {
  return {
    scroller: pageScrollConfig.scroller ?? defaultPageScrollContext.scroller,
    axis: pageScrollConfig.axis ?? defaultPageScrollContext.axis,
  }
}

export function configureTheatrePageScroll(config: TheatrePageScrollConfig): {
  reset: () => void
} {
  const prev = pageScrollConfig
  pageScrollConfig = {
    scroller: config.scroller ?? prev.scroller,
    axis: config.axis ?? prev.axis,
  }
  if (config.scroller !== undefined || config.axis !== undefined) {
    setActivePageScrollContext(buildPageScrollContextFromConfig())
  }
  return {
    reset() {
      pageScrollConfig = prev
      setActivePageScrollContext(
        prev.scroller !== undefined || prev.axis !== undefined
          ? {
              scroller: prev.scroller ?? defaultPageScrollContext.scroller,
              axis: prev.axis ?? defaultPageScrollContext.axis,
            }
          : defaultPageScrollContext,
      )
    },
  }
}

export function getTheatrePageScrollConfig(): TheatrePageScrollConfig {
  return pageScrollConfig
}

/** Active page scroll context from {@link configureTheatrePageScroll}. */
export function getTheatrePageScrollContext(): PageScrollContext {
  const ctx = buildPageScrollContextFromConfig()
  setActivePageScrollContext(ctx)
  return ctx
}

export function createDefaultPageScrollDriver(
  scroller: PageScrollScroller = getTheatrePageScrollContext().scroller,
  axis: PageScrollAxis = resolvePageScrollAxis(getTheatrePageScrollContext()),
): ScrollDriver {
  if (
    typeof document !== 'undefined' &&
    scroller != null &&
    !isNativeDocumentScroller(scroller) &&
    scroller instanceof HTMLElement
  ) {
    return axis === 'horizontal'
      ? createElementHorizontalScrollDriver(scroller)
      : createElementScrollDriver(scroller)
  }
  return axis === 'horizontal'
    ? createNativeDocumentHorizontalScrollDriver()
    : createNativeDocumentScrollDriver()
}

export type AttachTheatrePageScrollOptions = {
  driver?: ScrollDriver
}

/**
 * Wires page-mode scroll → sequence sync using {@link configureTheatrePageScroll}
 * or an explicit driver (Lenis, overflow containers, etc.).
 */
export function attachTheatrePageScroll(
  sheet: ISheet,
  options: AttachTheatrePageScrollOptions = {},
): () => void {
  const ctx = getTheatrePageScrollContext()
  const driver =
    options.driver ??
    createDefaultPageScrollDriver(ctx.scroller, resolvePageScrollAxis(ctx))
  sheet.setPageScrollDriver(driver)
  return () => {
    sheet.setPageScrollDriver(undefined)
  }
}
