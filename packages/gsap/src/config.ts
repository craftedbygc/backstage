import type {OutlineNamespaceConfig} from '@unseenco/theatre-shared/utils/outlineNamespaces'
import type {
  PageScrollAxis,
  PageScrollScroller,
} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {
  defaultPageScrollContext,
  setActivePageScrollContext,
} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {setConfiguredGsapSheetObjectNamespace} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'
import {getGsapScrollTriggerPlugin} from './gsapScrollTriggerPlugin'

export type TheatreGsapPageScrollConfig = {
  /** Default scroller for ScrollTrigger layout and guards; `null` = native document. */
  scroller?: PageScrollScroller
  /** Page scroll axis (default vertical). */
  axis?: PageScrollAxis
  /**
   * @deprecated ScrollTrigger.defaults is applied automatically when `pageScroll` is configured.
   */
  applyScrollTriggerDefaults?: boolean
}

export type TheatreGsapConfig = {
  /** Outline namespace segment for GSAP proxy objects (default `GSAP`). */
  namespace?: string
  /** Applied to each sheet when the first GSAP object is registered on it. */
  outlineNamespace?: OutlineNamespaceConfig
  /** When true, skips the one-time gsap.ticker / core rAF integration warning. */
  suppressGsapTickerRafWarning?: boolean
  pageScroll?: TheatreGsapPageScrollConfig
}

let activeConfig: TheatreGsapConfig = {
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
}

setConfiguredGsapSheetObjectNamespace(activeConfig.namespace!)

function pageScrollContextFromConfig(pageScroll: TheatreGsapPageScrollConfig): {
  scroller: PageScrollScroller
  axis: PageScrollAxis
} {
  return {
    scroller: pageScroll.scroller ?? defaultPageScrollContext.scroller,
    axis: pageScroll.axis ?? defaultPageScrollContext.axis ?? 'vertical',
  }
}

function applyScrollTriggerDefaultsForPageScroll(
  pageScroll: TheatreGsapPageScrollConfig,
): void {
  const ScrollTrigger = getGsapScrollTriggerPlugin()
  const {scroller, axis} = pageScrollContextFromConfig(pageScroll)
  ScrollTrigger?.defaults?.({
    scroller: scroller ?? undefined,
    ...(axis === 'horizontal' ? {horizontal: true} : {}),
  })
}

export function configureTheatreGsap(config: TheatreGsapConfig): {
  reset: () => void
} {
  const prev = activeConfig
  activeConfig = {
    namespace: config.namespace ?? prev.namespace ?? 'GSAP',
    outlineNamespace: config.outlineNamespace ?? prev.outlineNamespace,
    suppressGsapTickerRafWarning:
      config.suppressGsapTickerRafWarning ?? prev.suppressGsapTickerRafWarning,
    pageScroll: config.pageScroll ?? prev.pageScroll,
  }
  setConfiguredGsapSheetObjectNamespace(activeConfig.namespace ?? 'GSAP')

  if (config.pageScroll !== undefined) {
    const ctx = pageScrollContextFromConfig(config.pageScroll)
    setActivePageScrollContext(ctx)
    applyScrollTriggerDefaultsForPageScroll(config.pageScroll)
  }

  return {
    reset() {
      activeConfig = prev
      setConfiguredGsapSheetObjectNamespace(prev.namespace ?? 'GSAP')
      if (prev.pageScroll !== undefined) {
        const ctx = pageScrollContextFromConfig(prev.pageScroll)
        setActivePageScrollContext(ctx)
        applyScrollTriggerDefaultsForPageScroll(prev.pageScroll)
      } else {
        setActivePageScrollContext(defaultPageScrollContext)
      }
    },
  }
}

export function getTheatreGsapConfig(): TheatreGsapConfig {
  return activeConfig
}
