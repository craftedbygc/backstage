import {
  gsapClipLocalProgress,
  isBasicKeyframedTrack,
  isGsapClipTrack,
} from './trackData'

describe('trackData helpers', () => {
  test('gsapClipLocalProgress clamps', () => {
    expect(gsapClipLocalProgress(0, {start: 1, duration: 2})).toBe(0)
    expect(gsapClipLocalProgress(2, {start: 1, duration: 2})).toBe(0.5)
    expect(gsapClipLocalProgress(3, {start: 1, duration: 2})).toBe(1)
    expect(gsapClipLocalProgress(10, {start: 1, duration: 2})).toBe(1)
  })

  test('type guards', () => {
    expect(
      isBasicKeyframedTrack({type: 'BasicKeyframedTrack', keyframes: []}),
    ).toBe(true)
    expect(
      isGsapClipTrack({
        type: 'GsapClipTrack',
        gsapAnimationId: 'a',
        start: 0,
        duration: 1,
      }),
    ).toBe(true)
  })
})
