/**
 * Theatre Lite studio mode: compile-time (`__THEATRE_LITE__` in the lite bundle),
 * entry-point force flag (`__THEATRE_FORCE_LITE__` when loading studio-lite from
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

export function isTheatreLiteStudioCompileTime(): boolean {
  return typeof __THEATRE_LITE__ !== 'undefined' && __THEATRE_LITE__ === true
}

/** True when loaded via `@unseenco/theatre-studio-lite` from source without esbuild lite define. */
export function isTheatreLiteStudioForceFromEntry(): boolean {
  if (typeof globalThis === 'undefined') {
    return false
  }
  return !!(
    globalThis as typeof globalThis & {__THEATRE_FORCE_LITE__?: boolean}
  ).__THEATRE_FORCE_LITE__
}

/**
 * Lite mode is locked for the studio-lite bundle / entry — cannot switch to full studio.
 */
export function isTheatreLiteStudioLocked(): boolean {
  return isTheatreLiteStudioCompileTime() || isTheatreLiteStudioForceFromEntry()
}

export function isTheatreLiteStudio(): boolean {
  if (isTheatreLiteStudioLocked()) {
    return true
  }
  return runtimeStudioMode === 'lite'
}
