import {
  sequencerLeftCompositePaddingLeftPx,
  sequencerLeftHierarchyLineLeftPx,
  sequencerLeftLabelAlignedPaddingLeftPx,
} from './sequencerLeftPanelLayout'

describe('sequencerLeftPanelLayout', () => {
  test('label-aligned padding matches composite label start', () => {
    const parentDepth = 1
    const childDepth = 2
    const parentLabelStartPx =
      sequencerLeftCompositePaddingLeftPx(parentDepth) +
      18 +
      4 /* gap after hierarchy branch */
    expect(sequencerLeftLabelAlignedPaddingLeftPx(childDepth)).toBe(
      parentLabelStartPx,
    )
    expect(parentLabelStartPx).toBe(42)
  })

  test('hierarchy spine sits under parent chevron center', () => {
    expect(sequencerLeftHierarchyLineLeftPx(2)).toBe(29)
  })
})
