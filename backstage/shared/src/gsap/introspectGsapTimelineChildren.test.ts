import {
  introspectGsapTimelineChildren,
  isGsapTimeline,
} from './introspectGsapTimelineChildren'

describe('introspectGsapTimelineChildren', () => {
  test('isGsapTimeline detects children', () => {
    const timeline = {
      getChildren: () => [{startTime: () => 0, duration: () => 1}],
      duration: () => 2,
    }
    expect(isGsapTimeline(timeline)).toBe(true)
    expect(introspectGsapTimelineChildren(timeline)).toEqual([
      expect.objectContaining({
        childId: 'child_0',
        localStart: 0,
        localDuration: 1,
      }),
    ])
  })

  test('single tween is not a timeline', () => {
    const tween = {duration: () => 1}
    expect(isGsapTimeline(tween)).toBe(false)
  })
})
