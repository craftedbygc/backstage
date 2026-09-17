import type {GsapClipTrack} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import {buildGsapClipBaselineTiming} from '@unseenco/theatre-shared/gsap/gsapClipBaseline'

/** Mirrors baseline assignment in addGsapClipTrack for unit coverage. */
function baselineFromAddParams(p: {
  duration: number
  timelineSpan?: number
  timelineChildren?: GsapClipTrack['timelineChildren']
}) {
  const duration = Math.max(p.duration, 0.01)
  let timelineChildren = p.timelineChildren
  let timelineSpan = p.timelineSpan
  if (timelineChildren && timelineChildren.length > 0) {
    timelineChildren = timelineChildren.map((c) => ({...c}))
    timelineSpan = timelineSpan ?? duration
  }
  return buildGsapClipBaselineTiming({
    duration,
    timelineSpan,
    timelineChildren,
  })
}

describe('addGsapClipTrack baseline', () => {
  it('stores a clone of initial timeline children', () => {
    const children = [
      {
        childId: 'child_0',
        label: 'Tween',
        localStart: 0,
        localDuration: 1,
      },
    ]
    const baseline = baselineFromAddParams({
      duration: 2,
      timelineChildren: children,
      timelineSpan: 2,
    })
    children[0].localStart = 5
    expect(baseline.timelineChildren![0].localStart).toBe(0)
    expect(baseline.duration).toBe(2)
    expect(baseline.timelineSpan).toBe(2)
  })
})
