export function isTheatreLiteMode(): boolean {
  if (typeof __THEATRE_LITE__ !== 'undefined' && __THEATRE_LITE__ === true) {
    return true
  }
  if (typeof globalThis !== 'undefined') {
    return !!(
      globalThis as typeof globalThis & {__THEATRE_FORCE_LITE__?: boolean}
    ).__THEATRE_FORCE_LITE__
  }
  return false
}
