import type {ISheet} from '@unseenco/theatre-core/sheets/TheatreSheet'
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
  let suppressGeneration = 0

  const getMaxScroll = (): number => {
    const el = document.documentElement
    return Math.max(0, el.scrollHeight - window.innerHeight)
  }

  const getProgress = (): number => {
    const max = getMaxScroll()
    if (max <= 0) return 0
    const y = window.scrollY
    // Snap to exact ends — avoids playhead stuck below 0% / above 100% on fast scroll.
    if (y <= 1) return 0
    if (y >= max - 1) return 1
    return y / max
  }

  const setProgress = (progress: number): void => {
    const max = getMaxScroll()
    const clamped = Math.max(0, Math.min(1, progress))
    const gen = ++suppressGeneration
    suppressScrollEvents = true
    window.scrollTo({top: clamped * max, behavior: 'instant'})
    const release = () => {
      if (gen === suppressGeneration) {
        suppressScrollEvents = false
      }
    }
    requestAnimationFrame(() => requestAnimationFrame(release))
  }

  return {
    getProgress,
    setProgress,
    subscribe(onProgressChange): () => void {
      let rafId = 0
      const flush = () => {
        rafId = 0
        if (suppressScrollEvents) return
        onProgressChange(getProgress())
      }
      const scheduleFlush = () => {
        if (rafId !== 0) return
        rafId = requestAnimationFrame(flush)
      }
      const handler = () => scheduleFlush()
      window.addEventListener('scroll', handler, {passive: true})
      window.addEventListener('resize', handler)
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', () => {
          suppressScrollEvents = false
          onProgressChange(getProgress())
        })
      }
      return () => {
        window.removeEventListener('scroll', handler)
        window.removeEventListener('resize', handler)
        if (rafId !== 0) cancelAnimationFrame(rafId)
      }
    },
  }
}

/**
 * Keeps `sheet.sequence.position` aligned with scroll progress in page mode.
 * Progress maps to `[0, sequence.length]` (length is 100 in page mode).
 *
 * Scroll drives the playhead only (scroll → position). To move the page when
 * scrubbing in Studio, call {@link syncNativeDocumentScrollToSequencePosition}.
 */
export function attachSheetScrollDriver(
  sheet: ISheet,
  driver: ScrollDriver = createNativeDocumentScrollDriver(),
): () => void {
  const sequence = sheet.sequence

  const syncPositionFromScroll = (progress: number) => {
    const length = val(sequence.pointer.length)
    if (length <= 0) return
    sequence.position = progress * length
  }

  const untapScroll = driver.subscribe((progress) => {
    syncPositionFromScroll(progress)
  })

  syncPositionFromScroll(driver.getProgress())

  return () => {
    untapScroll()
  }
}

/** Scroll the native document to match the current sequence playhead (page mode UI). */
export function syncNativeDocumentScrollToSequencePosition(
  sheet: ISheet,
): void {
  const length = val(sheet.sequence.pointer.length)
  if (length <= 0) return
  const progress = sheet.sequence.position / length
  createNativeDocumentScrollDriver().setProgress(progress)
}
