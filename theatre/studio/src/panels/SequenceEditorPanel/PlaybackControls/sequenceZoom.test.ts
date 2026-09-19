import {
  defaultClippedSpaceRange,
  getZoomExtents,
  zoomLevelFromRange,
} from './sequenceZoom'

describe('sequenceZoom', () => {
  it('defaultClippedSpaceRange matches fully zoomed-out extent', () => {
    const sequenceLength = 10
    const subUnitsPerUnit = 30
    const range = defaultClippedSpaceRange(sequenceLength, subUnitsPerUnit)
    const {maxWidth} = getZoomExtents(sequenceLength, subUnitsPerUnit)

    expect(range).toEqual({start: 0, end: maxWidth})
    expect(
      zoomLevelFromRange(range, sequenceLength, subUnitsPerUnit),
    ).toBeCloseTo(0)
  })

  it('defaultClippedSpaceRange uses sequence length (e.g. page-style 0–100)', () => {
    const sequenceLength = 100
    const subUnitsPerUnit = 1
    const range = defaultClippedSpaceRange(sequenceLength, subUnitsPerUnit)

    expect(range.start).toBe(0)
    expect(range.end).toBe(125)
    expect(
      zoomLevelFromRange(range, sequenceLength, subUnitsPerUnit),
    ).toBeCloseTo(0)
  })
})
