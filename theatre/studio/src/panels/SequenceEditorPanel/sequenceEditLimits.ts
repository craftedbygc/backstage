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

export function clampGsapClipTiming(
  start: number,
  duration: number,
  sheet: Sheet,
): {start: number; duration: number} {
  const cap = getSequenceEditorLengthCap(sheet)
  let nextDuration = Math.max(MIN_GSAP_CLIP_DURATION, duration)
  let nextStart = Math.max(0, start)
  if (nextStart + nextDuration > cap) {
    nextDuration = Math.max(MIN_GSAP_CLIP_DURATION, cap - nextStart)
  }
  if (nextStart + nextDuration > cap) {
    nextStart = Math.max(0, cap - nextDuration)
  }
  return {start: nextStart, duration: nextDuration}
}

export {MIN_GSAP_CLIP_DURATION}
