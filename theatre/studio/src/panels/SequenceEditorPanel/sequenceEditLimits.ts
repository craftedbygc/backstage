import type Sheet from '@unseenco/theatre-core/sheets/Sheet'
import {getStudioSequence} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import {clamp} from 'lodash-es'

const MIN_GSAP_CLIP_DURATION = 0.01

/** Max sequence position for edits (matches runtime sequence length, including page mode). */
export function getSequenceEditorLengthCap(sheet: Sheet): number {
  return getStudioSequence(sheet).length
}

export function clampSequenceEditorPosition(
  position: number,
  sheet: Sheet,
): number {
  return clamp(position, 0, getSequenceEditorLengthCap(sheet))
}

/** Move whole clip: only `start` changes; duration stays fixed at the drag start. */
export function limitGsapClipMoveStart(
  proposedStart: number,
  duration: number,
  sheet: Sheet,
): number {
  const cap = getSequenceEditorLengthCap(sheet)
  const maxStart = Math.max(0, cap - Math.max(MIN_GSAP_CLIP_DURATION, duration))
  return clamp(proposedStart, 0, maxStart)
}

/** Resize from the right edge: only `duration` changes; start stays fixed. */
export function limitGsapClipResizeEndDuration(
  start: number,
  proposedDuration: number,
  sheet: Sheet,
): number {
  const cap = getSequenceEditorLengthCap(sheet)
  const maxDuration = Math.max(MIN_GSAP_CLIP_DURATION, cap - Math.max(0, start))
  return clamp(
    Math.max(MIN_GSAP_CLIP_DURATION, proposedDuration),
    MIN_GSAP_CLIP_DURATION,
    maxDuration,
  )
}

/** Resize from the left edge: right edge (sequence end) stays at `fixedEnd`. */
export function limitGsapClipResizeStart(
  proposedStart: number,
  fixedEnd: number,
  sheet: Sheet,
): {start: number; duration: number} {
  const cap = getSequenceEditorLengthCap(sheet)
  const end = Math.min(Math.max(0, fixedEnd), cap)
  const start = clamp(proposedStart, 0, end - MIN_GSAP_CLIP_DURATION)
  return {
    start,
    duration: Math.max(MIN_GSAP_CLIP_DURATION, end - start),
  }
}

/** New clip or ambiguous updates: cap end without shifting start to “fit”. */
export function limitGsapClipEndWithoutResizingPastDrag(
  start: number,
  duration: number,
  sheet: Sheet,
): {start: number; duration: number} {
  const cappedStart = Math.max(0, start)
  const cappedDuration = limitGsapClipResizeEndDuration(
    cappedStart,
    duration,
    sheet,
  )
  return {start: cappedStart, duration: cappedDuration}
}

export {MIN_GSAP_CLIP_DURATION}
