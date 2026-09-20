/*
 * @jest-environment jsdom
 */
import {
  getMaxScrollForScroller,
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

describe('getMaxScrollForScroller', () => {
  test('uses element scrollHeight for custom scroller', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollHeight', {value: 500, configurable: true})
    Object.defineProperty(el, 'clientHeight', {value: 100, configurable: true})
    expect(getMaxScrollForScroller(el)).toBe(400)
  })
})
