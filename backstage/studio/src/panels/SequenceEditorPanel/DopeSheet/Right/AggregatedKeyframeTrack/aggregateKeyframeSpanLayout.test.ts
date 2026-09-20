import {aggregateKeyframeSpanInUnitSpace} from './aggregateKeyframeSpanLayout'
import {
  aggregateSpanScaleFromFixedEnd,
  aggregateSpanScaleFromFixedStart,
} from './aggregateKeyframeSpanDrag'

describe('aggregateKeyframeSpanInUnitSpace', () => {
  test('returns null when there are no keyframe positions', () => {
    expect(
      aggregateKeyframeSpanInUnitSpace({
        byPosition: new Map(),
        tracks: [],
      }),
    ).toBeNull()
  })

  test('spans from min to max child keyframe position', () => {
    expect(
      aggregateKeyframeSpanInUnitSpace({
        byPosition: new Map([
          [2, []],
          [0, []],
          [5, []],
        ]),
        tracks: [],
      }),
    ).toEqual({start: 0, duration: 5})
  })
})

describe('aggregate span scale helpers', () => {
  test('aggregateSpanScaleFromFixedStart stretches from the left edge', () => {
    expect(aggregateSpanScaleFromFixedStart(0, 10, 20)).toBe(2)
    expect(aggregateSpanScaleFromFixedStart(0, 10, 5)).toBe(0.5)
  })

  test('aggregateSpanScaleFromFixedEnd stretches from the right edge', () => {
    expect(aggregateSpanScaleFromFixedEnd(0, 10, 5)).toBe(0.5)
    expect(aggregateSpanScaleFromFixedEnd(2, 10, 6)).toBe(0.5)
  })
})
