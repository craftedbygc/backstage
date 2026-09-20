import type {ISheet} from '@unseenco/backstage/sheets/BackstageSheet'
import {
  createElementHorizontalScrollDriver,
  createElementScrollDriver,
  createNativeDocumentHorizontalScrollDriver,
  createNativeDocumentScrollDriver,
} from '@unseenco/backstage/sheets/attachSheetScrollDriver'
import type {ScrollDriver} from '@unseenco/backstage/sheets/attachSheetScrollDriver'
import {
  defaultPageScrollContext,
  isNativeDocumentScroller,
  resolvePageScrollAxis,
  setActivePageScrollContext,
} from '@unseenco/backstage/sheets/pageScrollContext'
import type {
  PageScrollAxis,
  PageScrollContext,
  PageScrollScroller,
} from '@unseenco/backstage/sheets/pageScrollContext'

export type BackstagePageScrollConfig = {
  /** Default scroller for page-mode layout helpers; `null` = native document. */
  scroller?: PageScrollScroller
  /** Scroll axis (default vertical). */
  axis?: PageScrollAxis
}

let pageScrollConfig: BackstagePageScrollConfig = {}

function buildPageScrollContextFromConfig(): PageScrollContext {
  return {
    scroller: pageScrollConfig.scroller ?? defaultPageScrollContext.scroller,
    axis: pageScrollConfig.axis ?? defaultPageScrollContext.axis,
  }
}

export function configureBackstagePageScroll(config: BackstagePageScrollConfig): {
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

export function getBackstagePageScrollConfig(): BackstagePageScrollConfig {
  return pageScrollConfig
}

/** Active page scroll context from {@link configureBackstagePageScroll}. */
export function getBackstagePageScrollContext(): PageScrollContext {
  const ctx = buildPageScrollContextFromConfig()
  setActivePageScrollContext(ctx)
  return ctx
}

export function createDefaultPageScrollDriver(
  scroller: PageScrollScroller = getBackstagePageScrollContext().scroller,
  axis: PageScrollAxis = resolvePageScrollAxis(getBackstagePageScrollContext()),
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

export type AttachBackstagePageScrollOptions = {
  driver?: ScrollDriver
}

/**
 * Wires page-mode scroll → sequence sync using {@link configureBackstagePageScroll}
 * or an explicit driver (Lenis, overflow containers, etc.).
 */
export function attachBackstagePageScroll(
  sheet: ISheet,
  options: AttachBackstagePageScrollOptions = {},
): () => void {
  const ctx = getBackstagePageScrollContext()
  const driver =
    options.driver ??
    createDefaultPageScrollDriver(ctx.scroller, resolvePageScrollAxis(ctx))
  sheet.setPageScrollDriver(driver)
  return () => {
    sheet.setPageScrollDriver(undefined)
  }
}
