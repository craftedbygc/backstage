/**
 * Set before other core modules load when using `@unseenco/theatre-core/core-lite` from
 * source (e.g. Vite playground aliases) where `__THEATRE_LITE__` is not defined at build time.
 */
;(
  globalThis as typeof globalThis & {__THEATRE_FORCE_LITE__?: boolean}
).__THEATRE_FORCE_LITE__ = true
