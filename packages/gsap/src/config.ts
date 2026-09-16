import type {OutlineNamespaceConfig} from '@unseenco/theatre-shared/utils/outlineNamespaces'
import {setConfiguredGsapSheetObjectNamespace} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'

export type TheatreGsapConfig = {
  /** Outline namespace segment for GSAP proxy objects (default `GSAP`). */
  namespace?: string
  /** Applied to each sheet when the first GSAP object is registered on it. */
  outlineNamespace?: OutlineNamespaceConfig
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
  }
  setConfiguredGsapSheetObjectNamespace(activeConfig.namespace ?? 'GSAP')
  return {
    reset() {
      activeConfig = prev
    },
  }
}

export function getTheatreGsapConfig(): TheatreGsapConfig {
  return activeConfig
}
