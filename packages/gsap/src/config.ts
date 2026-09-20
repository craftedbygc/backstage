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

function applyScrollTriggerDefaultsForPageScroll(
  scroller: PageScrollScroller | undefined,
): void {
  const ScrollTrigger = getGsapScrollTriggerPlugin()
  ScrollTrigger?.defaults?.({
    scroller: scroller ?? undefined,
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
    setActivePageScrollContext({
      scroller: config.pageScroll.scroller ?? defaultPageScrollContext.scroller,
    })
    applyScrollTriggerDefaultsForPageScroll(
      config.pageScroll.scroller ?? defaultPageScrollContext.scroller,
    )
  }

  return {
    reset() {
      activeConfig = prev
      setConfiguredGsapSheetObjectNamespace(prev.namespace ?? 'GSAP')
      if (prev.pageScroll !== undefined) {
        setActivePageScrollContext({
          scroller:
            prev.pageScroll.scroller ?? defaultPageScrollContext.scroller,
        })
        applyScrollTriggerDefaultsForPageScroll(
          prev.pageScroll.scroller ?? defaultPageScrollContext.scroller,
        )
      } else {
        setActivePageScrollContext(defaultPageScrollContext)
      }
    },
  }
}

export function getTheatreGsapConfig(): TheatreGsapConfig {
  return activeConfig
}
