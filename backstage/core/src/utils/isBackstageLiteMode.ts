export function isBackstageLiteMode(): boolean {
  if (typeof __BACKSTAGE_LITE__ !== 'undefined' && __BACKSTAGE_LITE__ === true) {
    return true
  }
  if (typeof globalThis !== 'undefined') {
    return !!(
      globalThis as typeof globalThis & {__BACKSTAGE_FORCE_LITE__?: boolean}
    ).__BACKSTAGE_FORCE_LITE__
  }
  return false
}
