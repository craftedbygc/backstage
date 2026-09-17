import {
  gsapClipBarLayoutInScaledSpace,
  playheadClippedXWhenAlignedWithClipStart,
} from './gsapClipBarLayout'

describe('gsapClipBarLayoutInScaledSpace', () => {
  const leftPadding = 10
  const fromUnitSpace = (u: number) => u * 100

  const scaledSpace = {fromUnitSpace, leftPadding}

  test('left edge matches playhead at clip start (no scroll)', () => {
    const start = 1
    const {leftPx} = gsapClipBarLayoutInScaledSpace(
      {start, duration: 0.35},
      scaledSpace,
    )
    const playheadX = playheadClippedXWhenAlignedWithClipStart(start, {
      fromUnitSpace: (u) => fromUnitSpace(u - 0) + leftPadding,
    })
    expect(leftPx).toBe(playheadX)
  })

  test('left edge matches playhead when scrolled', () => {
    const rangeStart = 0.5
    const clipStart = 1
    const {leftPx} = gsapClipBarLayoutInScaledSpace(
      {start: clipStart, duration: 0.35},
      scaledSpace,
    )
    const playheadX = playheadClippedXWhenAlignedWithClipStart(clipStart, {
      fromUnitSpace: (u) =>
        fromUnitSpace(u - rangeStart) + leftPadding,
    })
    // Bar lives in scroll content; viewport X subtracts scroll (= fromUnitSpace(rangeStart)).
    const barXInViewport = leftPx - fromUnitSpace(rangeStart)
    expect(barXInViewport).toBe(playheadX)
  })

  test('width spans duration in scaled space', () => {
    const {widthPx} = gsapClipBarLayoutInScaledSpace(
      {start: 2, duration: 0.5},
      scaledSpace,
    )
    expect(widthPx).toBe(fromUnitSpace(0.5))
  })
})
