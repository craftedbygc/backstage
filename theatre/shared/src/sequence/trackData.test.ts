import {
  gsapClipEndTime,
  gsapClipLocalProgress,
  gsapClipSyncProgress,
  isBasicKeyframedTrack,
  isGsapClipTrack,
  maxGsapClipEndTime,
} from './trackData'

describe('trackData helpers', () => {
  test('gsapClipLocalProgress clamps', () => {
    expect(gsapClipLocalProgress(0, {start: 1, duration: 2})).toBe(0)
    expect(gsapClipLocalProgress(2, {start: 1, duration: 2})).toBe(0.5)
    expect(gsapClipLocalProgress(3, {start: 1, duration: 2})).toBe(1)
    expect(gsapClipLocalProgress(10, {start: 1, duration: 2})).toBe(1)
  })

  test('gsapClipSyncProgress holds completed state after clip end', () => {
    const clip = {start: 5, duration: 1}
    expect(gsapClipSyncProgress(4, clip)).toBe(0)
    expect(gsapClipSyncProgress(5.5, clip)).toBe(0.5)
    expect(gsapClipSyncProgress(6, clip)).toBe(1)
    expect(gsapClipSyncProgress(7, clip)).toBe(1)
    expect(gsapClipSyncProgress(100, clip)).toBe(1)
  })

  test('gsapClipSyncProgress at clip end and one step before', () => {
    const clip = {start: 8, duration: 0.35}
    const end = gsapClipEndTime(clip)
    expect(gsapClipSyncProgress(end, clip)).toBe(1)
    expect(gsapClipSyncProgress(end - 1 / 30, clip)).toBeLessThan(1)
    expect(gsapClipSyncProgress(end + 1e-4, clip)).toBe(1)
  })

  test('maxGsapClipEndTime', () => {
    expect(
      maxGsapClipEndTime([
        {start: 0, duration: 2},
        {start: 8, duration: 0.35},
      ]),
    ).toBe(8.35)
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
