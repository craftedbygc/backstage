import type {OutlineNamespaceConfig} from '@unseenco/theatre-shared/utils/outlineNamespaces'
import type {PageScrollScroller} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {
  defaultPageScrollContext,
  setActivePageScrollContext,
} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {setConfiguredGsapSheetObjectNamespace} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'
import {getGsapScrollTriggerPlugin} from './gsapScrollTriggerPlugin'

export type TheatreGsapPageScrollConfig = {
  /** Default scroller for ScrollTrigger layout and guards; `null` = document vertical. */
  scroller?: PageScrollScroller
  /** When true, calls `ScrollTrigger.defaults({ scroller })` on configure / attach. */
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
  if (config.pageScroll) {
    setActivePageScrollContext({
      scroller: config.pageScroll.scroller ?? defaultPageScrollContext.scroller,
    })
  }
  if (activeConfig.pageScroll?.applyScrollTriggerDefaults) {
    const ScrollTrigger = getGsapScrollTriggerPlugin()
    ScrollTrigger?.defaults?.({
      scroller: activeConfig.pageScroll.scroller ?? undefined,
    })
  }
  return {
    reset() {
      activeConfig = prev
      setConfiguredGsapSheetObjectNamespace(prev.namespace ?? 'GSAP')
      setActivePageScrollContext(
        prev.pageScroll
          ? {
              scroller:
                prev.pageScroll.scroller ?? defaultPageScrollContext.scroller,
            }
          : defaultPageScrollContext,
      )
    },
  }
}

export function getTheatreGsapConfig(): TheatreGsapConfig {
  return activeConfig
}
