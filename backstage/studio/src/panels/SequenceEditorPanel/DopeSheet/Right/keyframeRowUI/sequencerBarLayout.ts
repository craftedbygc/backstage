/** Left edge and width of a sequencer bar in dope-sheet scaled space (matches keyframe rows). */
export function sequencerBarLayoutInScaledSpace(
  span: {start: number; duration: number},
  scaledSpace: {
    fromUnitSpace: (u: number) => number
    leftPadding: number
  },
): {leftPx: number; widthPx: number} {
  const leftPx = scaledSpace.leftPadding + scaledSpace.fromUnitSpace(span.start)
  const rightPx =
    scaledSpace.leftPadding +
    scaledSpace.fromUnitSpace(span.start + span.duration)
  const widthPx = Math.max(rightPx - leftPx, 4)
  return {leftPx, widthPx}
}
