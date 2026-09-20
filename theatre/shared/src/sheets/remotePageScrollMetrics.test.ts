import {
  resolveMaxScrollPxForPageLayout,
  setRemotePageScrollMetrics,
} from './remotePageScrollMetrics'

describe('resolveMaxScrollPxForPageLayout', () => {
  afterEach(() => {
    setRemotePageScrollMetrics(undefined)
  })

  test('prefers local max scroll when positive', () => {
    setRemotePageScrollMetrics({maxScroll: 5000, axis: 'vertical'})
    expect(resolveMaxScrollPxForPageLayout(1200, 'vertical')).toBe(1200)
  })

  test('uses remote metrics when local max scroll is zero', () => {
    setRemotePageScrollMetrics({maxScroll: 3200, axis: 'vertical'})
    expect(resolveMaxScrollPxForPageLayout(0, 'vertical')).toBe(3200)
  })

  test('ignores remote metrics for a different axis', () => {
    setRemotePageScrollMetrics({maxScroll: 3200, axis: 'vertical'})
    expect(resolveMaxScrollPxForPageLayout(0, 'horizontal')).toBe(0)
  })
})
