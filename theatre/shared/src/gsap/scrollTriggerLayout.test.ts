import {
  getNativeDocumentMaxScroll,
  scrollPixelsToPageUnits,
} from './scrollTriggerLayout'

describe('scrollPixelsToPageUnits', () => {
  test('maps scroll range to sequence units', () => {
    expect(scrollPixelsToPageUnits(0, 500, 1000, 100)).toEqual({
      start: 0,
      duration: 50,
    })
    expect(scrollPixelsToPageUnits(250, 750, 1000, 100)).toEqual({
      start: 25,
      duration: 50,
    })
  })

  test('clamps when max scroll is zero', () => {
    expect(scrollPixelsToPageUnits(100, 200, 0, 100)).toEqual({
      start: 0,
      duration: 100,
    })
  })

  test('clamps end past sequence length', () => {
    const result = scrollPixelsToPageUnits(900, 1100, 1000, 100)
    expect(result.start + result.duration).toBeLessThanOrEqual(100 + 0.01)
  })
})

describe('getNativeDocumentMaxScroll', () => {
  test('returns non-negative number in jsdom', () => {
    expect(getNativeDocumentMaxScroll()).toBeGreaterThanOrEqual(0)
  })
})
