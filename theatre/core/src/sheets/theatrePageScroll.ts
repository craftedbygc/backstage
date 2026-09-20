import type {ISheet} from '@unseenco/theatre-core/sheets/TheatreSheet'
import {
  createElementScrollDriver,
  createNativeDocumentScrollDriver,
} from '@unseenco/theatre-core/sheets/attachSheetScrollDriver'
import type {ScrollDriver} from '@unseenco/theatre-core/sheets/attachSheetScrollDriver'
import {
  defaultPageScrollContext,
  isNativeDocumentScroller,
  setActivePageScrollContext,
} from '@unseenco/theatre-core/sheets/pageScrollContext'
import type {
  PageScrollContext,
  PageScrollScroller,
} from '@unseenco/theatre-core/sheets/pageScrollContext'

export type TheatrePageScrollConfig = {
  /** Default scroller for page-mode layout helpers; `null` = document vertical. */
  scroller?: PageScrollScroller
}

let pageScrollConfig: TheatrePageScrollConfig = {}

export function configureTheatrePageScroll(config: TheatrePageScrollConfig): {
  reset: () => void
} {
  const prev = pageScrollConfig
  pageScrollConfig = {
    scroller: config.scroller ?? prev.scroller,
  }
  if (config.scroller !== undefined) {
    setActivePageScrollContext({
      scroller: config.scroller ?? defaultPageScrollContext.scroller,
    })
  }
  return {
    reset() {
      pageScrollConfig = prev
      setActivePageScrollContext(
        prev.scroller !== undefined
          ? {
              scroller: prev.scroller ?? defaultPageScrollContext.scroller,
            }
          : defaultPageScrollContext,
      )
    },
  }
}

export function getTheatrePageScrollConfig(): TheatrePageScrollConfig {
  return pageScrollConfig
}

/** Active page scroll context (scroller) from {@link configureTheatrePageScroll}. */
export function getTheatrePageScrollContext(): PageScrollContext {
  const scroller =
    pageScrollConfig.scroller ?? defaultPageScrollContext.scroller
  const ctx = {scroller}
  setActivePageScrollContext(ctx)
  return ctx
}

export function createDefaultPageScrollDriver(
  scroller: PageScrollScroller = getTheatrePageScrollContext().scroller,
): ScrollDriver {
  if (
    typeof document !== 'undefined' &&
    scroller != null &&
    !isNativeDocumentScroller(scroller) &&
    scroller instanceof HTMLElement
  ) {
    return createElementScrollDriver(scroller)
  }
  return createNativeDocumentScrollDriver()
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
  const driver =
    options.driver ??
    createDefaultPageScrollDriver(getTheatrePageScrollContext().scroller)
  sheet.setPageScrollDriver(driver)
  return () => {
    sheet.setPageScrollDriver(undefined)
  }
}
