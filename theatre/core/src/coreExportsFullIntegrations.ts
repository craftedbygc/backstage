/**
 * Sequence playback / scroll / GSAP integration exports (full `@unseenco/theatre-core` only).
 */
export {attachGsapSequenceBridge} from './gsap/attachGsapSequenceBridge'
export {
  attachSheetScrollDriver,
  syncNativeDocumentScrollToSequencePosition,
  syncPageScrollToSequencePosition,
  createNativeDocumentScrollDriver,
  createElementScrollDriver,
  pageScrollProgressFromSequence,
  setPageScrollProgress,
  getSheetScrollDriver,
} from './sheets/attachSheetScrollDriver'
export type {ScrollDriver} from './sheets/attachSheetScrollDriver'
export {
  configureTheatrePageScroll,
  getTheatrePageScrollConfig,
  getTheatrePageScrollContext,
  attachTheatrePageScroll,
  createDefaultPageScrollDriver,
} from './sheets/theatrePageScroll'
export type {
  TheatrePageScrollConfig,
  AttachTheatrePageScrollOptions,
} from './sheets/theatrePageScroll'
export type {
  PageScrollContext,
  PageScrollScroller,
} from './sheets/pageScrollContext'
export {
  defaultPageScrollContext,
  getActivePageScrollContext,
  setActivePageScrollContext,
  isNativeDocumentScroller,
  pageScrollScrollersMatch,
  resolvePageScrollScroller,
  isVerticalPageScrollTrigger,
} from './sheets/pageScrollContext'
export type {SheetSequenceMode} from './sheets/sheetSequenceMode'
export {
  PAGE_MODE_SEQUENCE_LENGTH,
  PAGE_MODE_SUB_UNITS_PER_UNIT,
} from './sheets/sheetSequenceMode'
