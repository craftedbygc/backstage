/** Shared layout constants for the sequence editor left (label) column. */

import {css} from 'styled-components'

export const SEQUENCER_LEFT_DEPTH_INDENT_PX = 20
export const SEQUENCER_LEFT_CHEVRON_WIDTH_PX = 18
export const SEQUENCER_LEFT_LABEL_GAP_AFTER_HIERARCHY_PX = 4
export const SEQUENCER_LEFT_HIERARCHY_LINE_COLOR = 'rgb(209 209 209 / 10%)'
/** Matches `--sequencer-left-pane-bg` on the dope sheet container (floating vs docked). */
export const SEQUENCER_LEFT_PANE_BG_VAR =
  'var(--sequencer-left-pane-bg, #282b2f)'

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
  const branchEndPx = labelLeft - SEQUENCER_LEFT_LABEL_GAP_AFTER_HIERARCHY_PX
  return css`
    &::before {
      content: '';
      position: absolute;
      left: ${lineLeft}px;
      top: calc(var(--sequencer-left-row-header-height, 28px) / 2);
      transform: translateY(-50%);
      width: ${Math.max(0, branchEndPx - lineLeft)}px;
      height: 1px;
      background: ${SEQUENCER_LEFT_HIERARCHY_LINE_COLOR};
      pointer-events: none;
      z-index: 2;
    }
  `
}

/** Full-height vertical spine for an expanded group's child list. */
export function sequencerLeftHierarchyGroupSpineBeforeCss(childDepth: number) {
  if (childDepth <= 0) {
    return css``
  }
  const lineLeft = sequencerLeftHierarchyLineLeftPx(childDepth)
  return css`
    content: '';
    position: absolute;
    left: ${lineLeft}px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: ${SEQUENCER_LEFT_HIERARCHY_LINE_COLOR};
    pointer-events: none;
  `
}

/**
 * Hides the group spine below the last leaf row's horizontal branch (L-shaped corner).
 * Only applied when the last sibling has no nested child list.
 */
export function sequencerLeftHierarchyLastLeafSpineCoverAfterCss(
  childDepth: number,
  coverBackground: string = SEQUENCER_LEFT_PANE_BG_VAR,
) {
  if (childDepth <= 0) {
    return css``
  }
  const lineLeft = sequencerLeftHierarchyLineLeftPx(childDepth)
  return css`
    content: '';
    position: absolute;
    left: ${lineLeft}px;
    top: calc(var(--sequencer-left-row-header-height, 28px) / 2 + 1px);
    bottom: 0;
    width: 2px;
    margin-left: -0.5px;
    background: ${coverBackground};
    pointer-events: none;
    z-index: 1;
  `
}
