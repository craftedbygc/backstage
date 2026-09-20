import type {ISheet, ScrollDriver} from '@unseenco/theatre-core'
import {
  createElementScrollDriver,
  createNativeDocumentScrollDriver,
} from '@unseenco/theatre-core'
import {
  defaultPageScrollContext,
  isNativeDocumentScroller,
  setActivePageScrollContext,
} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import type {
  PageScrollContext,
  PageScrollScroller,
} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {getTheatreGsapConfig} from './config'
import {getGsapScrollTriggerPlugin} from './gsapScrollTriggerPlugin'

export function getTheatrePageScrollContext(): PageScrollContext {
  const pageScroll = getTheatreGsapConfig().pageScroll
  if (!pageScroll) {
    return defaultPageScrollContext
  }
  const ctx = {
    scroller: pageScroll.scroller ?? defaultPageScrollContext.scroller,
  }
  setActivePageScrollContext(ctx)
  return ctx
}

function applyScrollTriggerDefaultsFromConfig(): void {
  const {pageScroll} = getTheatreGsapConfig()
  if (!pageScroll?.applyScrollTriggerDefaults) return
  const ScrollTrigger = getGsapScrollTriggerPlugin()
  if (!ScrollTrigger?.defaults) return
  const scroller = pageScroll.scroller ?? undefined
  ScrollTrigger.defaults({scroller})
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
 * Wires page-mode scroll → sequence sync using {@link configureTheatreGsap} `pageScroll`
 * or an explicit driver (required for Lenis and other non-native scroll).
 */
export function attachTheatrePageScroll(
  sheet: ISheet,
  options: AttachTheatrePageScrollOptions = {},
): () => void {
  applyScrollTriggerDefaultsFromConfig()
  const driver =
    options.driver ??
    createDefaultPageScrollDriver(getTheatrePageScrollContext().scroller)
  sheet.setPageScrollDriver(driver)
  return () => {
    sheet.setPageScrollDriver(undefined)
  }
}
