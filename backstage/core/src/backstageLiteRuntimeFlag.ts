/**
 * Set before other core modules load when using `@unseenco/backstage/core-lite` from
 * source (e.g. Vite playground aliases) where `__BACKSTAGE_LITE__` is not defined at build time.
 */
;(
  globalThis as typeof globalThis & {__BACKSTAGE_FORCE_LITE__?: boolean}
).__BACKSTAGE_FORCE_LITE__ = true
