/**
 * Backstage Lite studio mode: compile-time (`__BACKSTAGE_LITE__` in the lite bundle),
 * entry-point force flag (`__BACKSTAGE_FORCE_LITE__` when loading studio-lite from
 * source, e.g. Vite playground aliases), or runtime via `studio.initialize({ mode: 'lite' })`.
 */
export type StudioMode = 'full' | 'lite'

let runtimeStudioMode: StudioMode | undefined

export function setRuntimeStudioMode(mode: StudioMode | undefined): void {
  runtimeStudioMode = mode
}

export function getRuntimeStudioMode(): StudioMode | undefined {
  return runtimeStudioMode
}

export function isBackstageLiteStudioCompileTime(): boolean {
  return typeof __BACKSTAGE_LITE__ !== 'undefined' && __BACKSTAGE_LITE__ === true
}

/** True when loaded via `@unseenco/backstage/studio-lite` from source without esbuild lite define. */
export function isBackstageLiteStudioForceFromEntry(): boolean {
  if (typeof globalThis === 'undefined') {
    return false
  }
  return !!(
    globalThis as typeof globalThis & {__BACKSTAGE_FORCE_LITE__?: boolean}
  ).__BACKSTAGE_FORCE_LITE__
}

/**
 * Lite mode is locked for the studio-lite bundle / entry — cannot switch to full studio.
 */
export function isBackstageLiteStudioLocked(): boolean {
  return isBackstageLiteStudioCompileTime() || isBackstageLiteStudioForceFromEntry()
}

export function isBackstageLiteStudio(): boolean {
  if (isBackstageLiteStudioLocked()) {
    return true
  }
  return runtimeStudioMode === 'lite'
}
