/**
 * Theatre Lite studio mode: compile-time (`__THEATRE_LITE__` in the lite bundle) or
 * runtime via `studio.initialize({ mode: 'lite' })`.
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

export function isTheatreLiteStudio(): boolean {
  if (isTheatreLiteStudioCompileTime()) {
    return true
  }
  return runtimeStudioMode === 'lite'
}
