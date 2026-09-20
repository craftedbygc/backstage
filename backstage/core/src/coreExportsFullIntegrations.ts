/**
 * Sequence playback / scroll / GSAP integration exports (full `@unseenco/backstage` only).
 */
export {attachGsapSequenceBridge} from './gsap/attachGsapSequenceBridge'
export {
  attachSheetScrollDriver,
  syncNativeDocumentScrollToSequencePosition,
  syncPageScrollToSequencePosition,
  createNativeDocumentScrollDriver,
  createNativeDocumentHorizontalScrollDriver,
  createElementScrollDriver,
  createElementHorizontalScrollDriver,
  pageScrollProgressFromSequence,
  setPageScrollProgress,
  getSheetScrollDriver,
} from './sheets/attachSheetScrollDriver'
export type {ScrollDriver} from './sheets/attachSheetScrollDriver'
export {
  configureBackstagePageScroll,
  getBackstagePageScrollConfig,
  getBackstagePageScrollContext,
  attachBackstagePageScroll,
  createDefaultPageScrollDriver,
} from './sheets/backstagePageScroll'
export type {
  BackstagePageScrollConfig,
  AttachBackstagePageScrollOptions,
} from './sheets/backstagePageScroll'
export type {
  PageScrollContext,
  PageScrollScroller,
  PageScrollAxis,
} from './sheets/pageScrollContext'
export {
  defaultPageScrollContext,
  getActivePageScrollContext,
  setActivePageScrollContext,
  isNativeDocumentScroller,
  pageScrollScrollersMatch,
  resolvePageScrollScroller,
  resolvePageScrollAxis,
  isPageScrollTrigger,
  isVerticalPageScrollTrigger,
} from './sheets/pageScrollContext'
export type {SheetSequenceMode} from './sheets/sheetSequenceMode'
export {
  PAGE_MODE_SEQUENCE_LENGTH,
  PAGE_MODE_SUB_UNITS_PER_UNIT,
} from './sheets/sheetSequenceMode'
