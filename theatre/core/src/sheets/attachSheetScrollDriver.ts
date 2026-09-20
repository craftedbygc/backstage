import type {ISheet} from '@unseenco/theatre-core/sheets/TheatreSheet'
import {val} from '@unseenco/theatre-dataverse'

/** Maps page scroll progress (0–1) to sequence position and back. */
export type ScrollDriver = {
  getProgress(): number
  setProgress(progress: number): void
  subscribe(onChange: (progress: number) => void): () => void
}

const sheetScrollDrivers = new WeakMap<ISheet, ScrollDriver>()

export function getSheetScrollDriver(sheet: ISheet): ScrollDriver | undefined {
  return sheetScrollDrivers.get(sheet)
}

function rememberSheetScrollDriver(sheet: ISheet, driver: ScrollDriver): void {
  sheetScrollDrivers.set(sheet, driver)
}

function progressFromScrollPosition(y: number, max: number): number {
  if (max <= 0) return 0
  if (y <= 1) return 0
  if (y >= max - 1) return 1
  return y / max
}

function createScrollDriverFromElement(
  getMaxScroll: () => number,
  getScrollPos: () => number,
  setScrollPos: (y: number) => void,
  addScrollListener: (handler: () => void) => () => void,
): ScrollDriver {
  let suppressScrollEvents = false
  let suppressGeneration = 0

  const getProgress = (): number => {
    const max = getMaxScroll()
    return progressFromScrollPosition(getScrollPos(), max)
  }

  const setProgress = (progress: number): void => {
    const max = getMaxScroll()
    const clamped = Math.max(0, Math.min(1, progress))
    const gen = ++suppressGeneration
    suppressScrollEvents = true
    setScrollPos(clamped * max)
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
      const removeScroll = addScrollListener(handler)
      const onResize = () => scheduleFlush()
      window.addEventListener('resize', onResize)
      return () => {
        removeScroll()
        window.removeEventListener('resize', onResize)
        if (rafId !== 0) cancelAnimationFrame(rafId)
      }
    },
  }
}

/** Native `window` / `documentElement` vertical scroll. */
export function createNativeDocumentScrollDriver(): ScrollDriver {
  const getMaxScroll = (): number => {
    const el = document.documentElement
    return Math.max(0, el.scrollHeight - window.innerHeight)
  }

  return createScrollDriverFromElement(
    getMaxScroll,
    () => window.scrollY,
    (y) => window.scrollTo({top: y, behavior: 'instant'}),
    (handler) => {
      window.addEventListener('scroll', handler, {passive: true})
      return () => window.removeEventListener('scroll', handler)
    },
  )
}

/** Vertical scroll on a custom overflow element. */
export function createElementScrollDriver(element: HTMLElement): ScrollDriver {
  const getMaxScroll = (): number =>
    Math.max(0, element.scrollHeight - element.clientHeight)

  return createScrollDriverFromElement(
    getMaxScroll,
    () => element.scrollTop,
    (y) => {
      element.scrollTop = y
    },
    (handler) => {
      element.addEventListener('scroll', handler, {passive: true})
      return () => element.removeEventListener('scroll', handler)
    },
  )
}

/**
 * Keeps `sheet.sequence.position` aligned with scroll progress in page mode.
 * Progress maps to `[0, sequence.length]` (length is 100 in page mode).
 */
export function attachSheetScrollDriver(
  sheet: ISheet,
  driver: ScrollDriver = createNativeDocumentScrollDriver(),
): () => void {
  rememberSheetScrollDriver(sheet, driver)
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

export function pageScrollProgressFromSequence(sheet: ISheet): number {
  const length = val(sheet.sequence.pointer.length)
  if (length <= 0) return 0
  return sheet.sequence.position / length
}

export function setPageScrollProgress(sheet: ISheet, progress: number): void {
  const length = val(sheet.sequence.pointer.length)
  if (length <= 0) return
  const clamped = Math.max(0, Math.min(1, progress))
  sheet.sequence.position = clamped * length
}

/** Scroll to match the current sequence playhead using the sheet's active driver. */
export function syncPageScrollToSequencePosition(
  sheet: ISheet,
  driver: ScrollDriver = getSheetScrollDriver(sheet) ??
    createNativeDocumentScrollDriver(),
): void {
  const progress = pageScrollProgressFromSequence(sheet)
  driver.setProgress(progress)
}

/** Scroll the native document to match the current sequence playhead (page mode UI). */
export function syncNativeDocumentScrollToSequencePosition(
  sheet: ISheet,
): void {
  syncPageScrollToSequencePosition(sheet, createNativeDocumentScrollDriver())
}
