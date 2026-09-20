/*
 * @jest-environment jsdom
 */
import {
  defaultPageScrollContext,
  isPageScrollTrigger,
  isVerticalPageScrollTrigger,
  pageScrollScrollersMatch,
  resolvePageScrollScroller,
} from './pageScrollContext'

describe('pageScrollContext', () => {
  test('isVerticalPageScrollTrigger accepts default document scroller', () => {
    expect(
      isVerticalPageScrollTrigger(
        {start: 0, end: 100},
        defaultPageScrollContext,
      ),
    ).toBe(true)
  })

  test('isVerticalPageScrollTrigger rejects horizontal', () => {
    expect(
      isVerticalPageScrollTrigger(
        {start: 0, end: 100, horizontal: true},
        defaultPageScrollContext,
      ),
    ).toBe(false)
  })

  test('isPageScrollTrigger accepts horizontal when context axis is horizontal', () => {
    const ctx = {...defaultPageScrollContext, axis: 'horizontal' as const}
    expect(
      isPageScrollTrigger({start: 0, end: 100, horizontal: true}, ctx),
    ).toBe(true)
    expect(isPageScrollTrigger({start: 0, end: 100}, ctx)).toBe(false)
    expect(
      isPageScrollTrigger(
        {start: 0, end: 100, horizontal: true},
        defaultPageScrollContext,
      ),
    ).toBe(false)
  })

  test('custom scroller matches when context scroller is same element', () => {
    const el = document.createElement('div')
    const ctx = {scroller: el, axis: 'vertical' as const}
    expect(
      isVerticalPageScrollTrigger({start: 0, end: 100, scroller: el}, ctx),
    ).toBe(true)
    expect(
      isVerticalPageScrollTrigger(
        {start: 0, end: 100, scroller: document.createElement('div')},
        ctx,
      ),
    ).toBe(false)
  })

  test('resolvePageScrollScroller prefers ST scroller', () => {
    const el = document.createElement('div')
    const other = document.createElement('section')
    expect(resolvePageScrollScroller({scroller: el}, other)).toBe(el)
    expect(resolvePageScrollScroller({}, other)).toBe(other)
    expect(resolvePageScrollScroller({}, null)).toBe(null)
  })

  test('pageScrollScrollersMatch treats native doc scrollers as equal', () => {
    expect(pageScrollScrollersMatch(null, null)).toBe(true)
    expect(pageScrollScrollersMatch(null, document.documentElement)).toBe(true)
  })
})
