import type {HistoricPositionalSequence} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import {
  collectGsapClipEdgeSnapPositions,
  collectSequenceEditorSnapPositions,
  gsapClipEdgeTimes,
  mergeKeyframeSnapPositions,
  type KeyframeSnapPositions,
} from './KeyframeSnapTarget'

describe('GSAP clip edge snapping helpers', () => {
  test('gsapClipEdgeTimes returns start and end in sequence units', () => {
    expect(gsapClipEdgeTimes({start: 2, duration: 3})).toEqual([2, 5])
  })

  test('collectGsapClipEdgeSnapPositions lists both clip edges per track', () => {
    const tracksByObject = {
      obj1: {
        trackIdByPropPath: {},
        trackData: {
          clipA: {
            type: 'GsapClipTrack',
            gsapAnimationId: 'a',
            start: 1,
            duration: 2,
          },
          pos: {
            type: 'BasicKeyframedTrack',
            keyframes: [],
          },
        },
      },
    }

    expect(
      collectGsapClipEdgeSnapPositions(
        tracksByObject as HistoricPositionalSequence['tracksByObject'],
      ),
    ).toEqual({
      obj1: {
        clipA: [1, 3],
      },
    })
  })

  test('collectSequenceEditorSnapPositions merges keyframes and clip edges', () => {
    const tracksByObject = {
      obj1: {
        trackIdByPropPath: {},
        trackData: {
          clipA: {
            type: 'GsapClipTrack',
            gsapAnimationId: 'a',
            start: 0,
            duration: 1,
          },
          pos: {
            type: 'BasicKeyframedTrack',
            keyframes: [{id: 'kf1', position: 4, value: 0}],
          },
        },
      },
    }

    expect(
      collectSequenceEditorSnapPositions(
        tracksByObject as HistoricPositionalSequence['tracksByObject'],
        {
        shouldIncludeKeyframe: () => true,
        },
      ),
    ).toEqual({
      obj1: {
        clipA: [0, 1],
        pos: [4],
      },
    })
  })

  test('mergeKeyframeSnapPositions dedupes positions on the same track', () => {
    expect(
      mergeKeyframeSnapPositions(
        {obj: {t1: [1, 2]}} as KeyframeSnapPositions,
        {obj: {t1: [2, 3]}} as KeyframeSnapPositions,
      ),
    ).toEqual({obj: {t1: [1, 2, 3]}} as KeyframeSnapPositions)
  })
})
