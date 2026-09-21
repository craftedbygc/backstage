/** Shared layout constants for the sequence editor left (label) column. */

import {css} from 'styled-components'

export const SEQUENCER_LEFT_DEPTH_INDENT_PX = 20
export const SEQUENCER_LEFT_CHEVRON_WIDTH_PX = 18
export const SEQUENCER_LEFT_LABEL_GAP_AFTER_HIERARCHY_PX = 4
export const SEQUENCER_LEFT_HIERARCHY_LINE_COLOR = 'rgb(209 209 209 / 10%)'

/** Padding for composite rows (objects, compound props) with a chevron column. */
export function sequencerLeftCompositePaddingLeftPx(depth: number): number {
  return depth * SEQUENCER_LEFT_DEPTH_INDENT_PX
}

/**
 * Padding so leaf prop labels align with the label of their parent composite row
 * (after the parent's chevron), not with the parent's chevron.
 */
export function sequencerLeftLabelAlignedPaddingLeftPx(depth: number): number {
  if (depth <= 0) {
    return 0
  }
  return (
    (depth - 1) * SEQUENCER_LEFT_DEPTH_INDENT_PX +
    SEQUENCER_LEFT_CHEVRON_WIDTH_PX +
    SEQUENCER_LEFT_LABEL_GAP_AFTER_HIERARCHY_PX
  )
}

/** X position of the vertical hierarchy spine for children at `childDepth`. */
export function sequencerLeftHierarchyLineLeftPx(childDepth: number): number {
  if (childDepth <= 0) {
    return 0
  }
  return (
    (childDepth - 1) * SEQUENCER_LEFT_DEPTH_INDENT_PX +
    SEQUENCER_LEFT_CHEVRON_WIDTH_PX / 2
  )
}

export function sequencerLeftHierarchyBranchBeforeCss(depth: number) {
  if (depth <= 0) {
    return css``
  }
  const lineLeft = sequencerLeftHierarchyLineLeftPx(depth)
  const labelLeft = sequencerLeftLabelAlignedPaddingLeftPx(depth)
  const branchEndPx =
    labelLeft - SEQUENCER_LEFT_LABEL_GAP_AFTER_HIERARCHY_PX
  return css`
    &::before {
      content: '';
      position: absolute;
      left: ${lineLeft}px;
      width: ${Math.max(0, branchEndPx - lineLeft)}px;
      height: 1px;
      background: ${SEQUENCER_LEFT_HIERARCHY_LINE_COLOR};
      pointer-events: none;
    }
  `
}
