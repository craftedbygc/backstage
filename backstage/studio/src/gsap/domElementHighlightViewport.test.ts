/*
 * @jest-environment jsdom
 */
import {
  getOffViewportSides,
  intersectRectWithViewport,
} from './domElementHighlightViewport'

describe('domElementHighlightViewport', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    })
  })

  test('intersectRectWithViewport detects any on-screen overlap', () => {
    const rect = {
      top: 50,
      left: -20,
      right: 80,
      bottom: 130,
      width: 100,
      height: 80,
    } as DOMRect
    const visible = intersectRectWithViewport(rect)!
    expect(visible.top).toBe(50)
    expect(visible.left).toBe(0)
    expect(visible.width).toBe(80)
    expect(visible.height).toBe(80)
  })

  test('getOffViewportSides ignores partial overflow', () => {
    const rect = {
      top: 580,
      left: -10,
      right: 190,
      bottom: 620,
      width: 200,
      height: 40,
    } as DOMRect
    expect(getOffViewportSides(rect)).toEqual({
      top: false,
      bottom: false,
      left: false,
      right: false,
    })
  })

  test('getOffViewportSides when fully below viewport', () => {
    const rect = {
      top: 610,
      left: 100,
      right: 200,
      bottom: 650,
      width: 100,
      height: 40,
    } as DOMRect
    expect(getOffViewportSides(rect)).toEqual({
      top: false,
      bottom: true,
      left: false,
      right: false,
    })
  })
})
