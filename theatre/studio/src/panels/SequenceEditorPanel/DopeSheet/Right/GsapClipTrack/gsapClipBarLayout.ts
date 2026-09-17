/** Left edge and width of a GSAP clip bar in dope-sheet scaled space (matches keyframe rows). */
export function gsapClipBarLayoutInScaledSpace(
  clip: {start: number; duration: number},
  scaledSpace: {
    fromUnitSpace: (u: number) => number
    leftPadding: number
  },
): {leftPx: number; widthPx: number} {
  const leftPx =
    scaledSpace.leftPadding + scaledSpace.fromUnitSpace(clip.start)
  const rightPx = scaledSpace.leftPadding + scaledSpace.fromUnitSpace(
    clip.start + clip.duration,
  )
  const widthPx = Math.max(rightPx - leftPx, 4)
  return {leftPx, widthPx}
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
