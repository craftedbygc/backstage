import {extractScrollTriggerLayout} from './extractScrollTriggerLayout'

describe('extractScrollTriggerLayout', () => {
  test('accepts horizontal ScrollTrigger when context axis is horizontal', () => {
    const result = extractScrollTriggerLayout(
      {
        horizontal: true,
        start: 100,
        end: 500,
        animation: {duration: () => 1, totalDuration: () => 1},
      },
      {
        sequenceLength: 100,
        pageScrollContext: {scroller: null, axis: 'horizontal'},
      },
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.layout.start).toBeGreaterThanOrEqual(0)
      expect(result.value.layout.duration).toBeGreaterThan(0)
    }
  })
})
