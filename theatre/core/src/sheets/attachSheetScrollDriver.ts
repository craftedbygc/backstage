import type {ISheet} from '@unseenco/theatre-core/sheets/TheatreSheet'
import {onChange} from '@unseenco/theatre-core/coreExports'
import {val} from '@unseenco/theatre-dataverse'

/** Maps page scroll progress (0–1) to sequence position and back. */
export type ScrollDriver = {
  getProgress(): number
  setProgress(progress: number): void
  subscribe(onChange: (progress: number) => void): () => void
}

/** Native `window` / `documentElement` vertical scroll. */
export function createNativeDocumentScrollDriver(): ScrollDriver {
  let suppressScrollEvents = false

  const getMaxScroll = (): number => {
    const el = document.documentElement
    return Math.max(0, el.scrollHeight - window.innerHeight)
  }

  const getProgress = (): number => {
    const max = getMaxScroll()
    if (max <= 0) return 0
    return window.scrollY / max
  }

  const setProgress = (progress: number): void => {
    const max = getMaxScroll()
    const clamped = Math.max(0, Math.min(1, progress))
    suppressScrollEvents = true
    window.scrollTo({top: clamped * max, behavior: 'instant'})
    requestAnimationFrame(() => {
      suppressScrollEvents = false
    })
  }

  return {
    getProgress,
    setProgress,
    subscribe(onProgressChange): () => void {
      const handler = () => {
        if (suppressScrollEvents) return
        onProgressChange(getProgress())
      }
      window.addEventListener('scroll', handler, {passive: true})
      window.addEventListener('resize', handler)
      return () => {
        window.removeEventListener('scroll', handler)
        window.removeEventListener('resize', handler)
      }
    },
  }
}

/**
 * Keeps `sheet.sequence.position` aligned with scroll progress in page mode.
 * Progress maps to `[0, sequence.length]` (length is 100 in page mode).
 */
export function attachSheetScrollDriver(
  sheet: ISheet,
  driver: ScrollDriver = createNativeDocumentScrollDriver(),
): () => void {
  const sequence = sheet.sequence
  let applyingFromScroll = false
  let applyingFromPosition = false

  const syncPositionFromScroll = (progress: number) => {
    const length = val(sequence.pointer.length)
    if (length <= 0) return
    applyingFromScroll = true
    sequence.position = progress * length
    applyingFromScroll = false
  }

  const untapScroll = driver.subscribe((progress) => {
    if (applyingFromPosition) return
    syncPositionFromScroll(progress)
  })

  const untapPosition = onChange(sequence.pointer.position, (position) => {
    if (applyingFromScroll) return
    const length = val(sequence.pointer.length)
    if (length <= 0) return
    applyingFromPosition = true
    driver.setProgress(position / length)
    applyingFromPosition = false
  })

  syncPositionFromScroll(driver.getProgress())

  return () => {
    untapScroll()
    untapPosition()
  }
}
