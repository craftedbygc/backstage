export type DebouncedCallback = {
  schedule: () => void
  flush: () => void
  cancel: () => void
}

/**
 * Coalesces rapid calls into a single `fn()` after `delayMs` of quiet time.
 * `flush()` runs immediately when a call is still pending; otherwise it is a no-op.
 */
export function createDebouncedCallback(
  fn: () => void,
  delayMs: number,
): DebouncedCallback {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const clearPending = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return {
    schedule() {
      clearPending()
      timeoutId = setTimeout(() => {
        timeoutId = undefined
        fn()
      }, delayMs)
    },
    flush() {
      if (timeoutId === undefined) return
      clearPending()
      fn()
    },
    cancel() {
      clearPending()
    },
  }
}
