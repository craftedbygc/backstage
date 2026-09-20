import type {
  PageScrollAxis,
  PageScrollScroller,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import {isNativeDocumentScroller} from '@unseenco/backstage-shared/sheets/pageScrollContext'

/** Minimum clip duration in sequence units (page mode uses 0–100). */
const MIN_SEQUENCE_DURATION = 0.01

/**
 * Maps resolved ScrollTrigger scroll positions (px on the document scroller)
 * to Theatre sequence units.
 */
export function scrollPixelsToPageUnits(
  startPx: number,
  endPx: number,
  maxScrollPx: number,
  sequenceLength: number,
): {start: number; duration: number} {
  const length = Math.max(sequenceLength, MIN_SEQUENCE_DURATION)

  if (maxScrollPx <= 0) {
    return {start: 0, duration: length}
  }

  const startProgress = Math.max(0, Math.min(1, startPx / maxScrollPx))
  const endProgress = Math.max(0, Math.min(1, endPx / maxScrollPx))
  const lo = Math.min(startProgress, endProgress)
  const hi = Math.max(startProgress, endProgress)

  let start = lo * length
  let duration = Math.max((hi - lo) * length, MIN_SEQUENCE_DURATION)

  if (start + duration > length) {
    start = Math.max(0, length - duration)
  }
  if (start < 0) start = 0

  return {start, duration}
}

/** Matches {@link createNativeDocumentScrollDriver} max scroll. */
export function getNativeDocumentMaxScroll(
  axis: PageScrollAxis = 'vertical',
): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0
  }
  const el = document.documentElement
  if (axis === 'horizontal') {
    const scrolling = (document.scrollingElement ?? el) as HTMLElement
    return Math.max(0, scrolling.scrollWidth - scrolling.clientWidth)
  }
  return Math.max(0, el.scrollHeight - window.innerHeight)
}

export function getMaxScrollForScroller(
  scroller: PageScrollScroller,
  axis: PageScrollAxis = 'vertical',
): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0
  }
  if (isNativeDocumentScroller(scroller)) {
    return getNativeDocumentMaxScroll(axis)
  }
  const el = scroller as HTMLElement
  if (axis === 'horizontal') {
    return Math.max(0, el.scrollWidth - el.clientWidth)
  }
  return Math.max(0, el.scrollHeight - el.clientHeight)
}

export function getMaxScrollForPageScrollContext(
  scroller: PageScrollScroller,
  axis: PageScrollAxis = 'vertical',
): number {
  return getMaxScrollForScroller(scroller, axis)
}
