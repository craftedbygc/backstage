import type {ScrollDriver} from './sheets/attachSheetScrollDriver'

/**
 * Minimal Lenis surface for {@link createLenisScrollDriver}.
 * Matches [Lenis](https://github.com/darkroomengineering/lenis) without importing the package.
 */
export type LenisScrollDriverSource = {
  readonly scroll: number
  readonly limit: number
  scrollTo(target: number, options?: {immediate?: boolean}): void
  on(event: 'scroll', handler: () => void): void
  off(event: 'scroll', handler: () => void): void
}

/** Maps Lenis scroll position to a Theatre {@link ScrollDriver} (0–1 progress). */
export function createLenisScrollDriver(
  lenis: LenisScrollDriverSource,
): ScrollDriver {
  const readProgress = (): number => {
    const limit = lenis.limit
    if (limit <= 0) return 0
    const progress = lenis.scroll / limit
    return Math.max(0, Math.min(1, progress))
  }

  return {
    getProgress: readProgress,
    setProgress(progress: number) {
      const limit = lenis.limit
      const clamped = Math.max(0, Math.min(1, progress))
      lenis.scrollTo(clamped * limit, {immediate: true})
    },
    subscribe(onChange) {
      const handler = () => {
        onChange(readProgress())
      }
      lenis.on('scroll', handler)
      return () => {
        lenis.off('scroll', handler)
      }
    },
  }
}
