import {sequencerBarLayoutInScaledSpace} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/sequencerBarLayout'

/** Left edge and width of a GSAP clip bar in dope-sheet scaled space (matches keyframe rows). */
export function gsapClipBarLayoutInScaledSpace(
  clip: {start: number; duration: number},
  scaledSpace: {
    fromUnitSpace: (u: number) => number
    leftPadding: number
  },
): {leftPx: number; widthPx: number} {
  return sequencerBarLayoutInScaledSpace(clip, scaledSpace)
}

/** Playhead X in clipped space when clip left edge aligns with playhead at clip start. */
export function playheadClippedXWhenAlignedWithClipStart(
  clipStartInUnitSpace: number,
  clippedSpace: {
    fromUnitSpace: (u: number) => number
  },
): number {
  return clippedSpace.fromUnitSpace(clipStartInUnitSpace)
}
