import type {GsapClipTrack} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import {
  applyGsapClipBaselineToTrack,
  applyGsapTimelineChildBaselineToTrack,
  buildGsapClipBaselineTiming,
} from './gsapClipBaseline'

describe('gsapClipBaseline', () => {
  it('deep-clones timeline children when building baseline', () => {
    const baseline = buildGsapClipBaselineTiming({
      duration: 2,
      timelineSpan: 3,
      timelineChildren: [
        {
          childId: 'child_0',
          label: 'A',
          localStart: 0,
          localDuration: 1,
        },
      ],
    })
    baseline.timelineChildren![0].localStart = 99
    expect(
      buildGsapClipBaselineTiming({
        duration: 2,
        timelineSpan: 3,
        timelineChildren: [
          {
            childId: 'child_0',
            label: 'A',
            localStart: 0,
            localDuration: 1,
          },
        ],
      }).timelineChildren![0].localStart,
    ).toBe(0)
  })

  it('reset restores parent clip timing without changing start', () => {
    const track: GsapClipTrack = {
      type: 'GsapClipTrack',
      gsapAnimationId: 'anim-1',
      start: 5,
      duration: 10,
      timelineSpan: 8,
      timelineChildren: [
        {
          childId: 'child_0',
          label: 'A',
          localStart: 2,
          localDuration: 4,
        },
      ],
      baselineTiming: buildGsapClipBaselineTiming({
        duration: 3,
        timelineSpan: 3,
        timelineChildren: [
          {
            childId: 'child_0',
            label: 'A',
            localStart: 0,
            localDuration: 1,
          },
        ],
      }),
    }
    applyGsapClipBaselineToTrack(
      track,
      buildGsapClipBaselineTiming(track.baselineTiming!),
    )
    expect(track.start).toBe(5)
    expect(track.duration).toBe(3)
    expect(track.timelineSpan).toBe(3)
    expect(track.timelineChildren![0].localStart).toBe(0)
    expect(track.timelineChildren![0].localDuration).toBe(1)
  })

  it('reset restores a single child local timing', () => {
    const baseline = buildGsapClipBaselineTiming({
      duration: 2,
      timelineSpan: 2,
      timelineChildren: [
        {
          childId: 'child_0',
          label: 'A',
          localStart: 0,
          localDuration: 1,
        },
        {
          childId: 'child_1',
          label: 'B',
          localStart: 1,
          localDuration: 1,
        },
      ],
    })
    const track: GsapClipTrack = {
      type: 'GsapClipTrack',
      gsapAnimationId: 'anim-1',
      start: 0,
      duration: 2,
      timelineSpan: 2,
      timelineChildren: [
        {
          childId: 'child_0',
          label: 'A',
          localStart: 0.5,
          localDuration: 0.5,
        },
        {
          childId: 'child_1',
          label: 'B',
          localStart: 2,
          localDuration: 2,
        },
      ],
      baselineTiming: baseline,
    }
    expect(
      applyGsapTimelineChildBaselineToTrack(track, 'child_0', baseline),
    ).toBe(true)
    expect(track.timelineChildren![0].localStart).toBe(0)
    expect(track.timelineChildren![0].localDuration).toBe(1)
    expect(track.timelineChildren![1].localStart).toBe(2)
    expect(track.timelineChildren![1].localDuration).toBe(2)
  })
})
