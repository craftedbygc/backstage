import type {SheetState_Historic} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SequenceVariantId} from '@unseenco/theatre-core/sequences/sequenceVariants'
import {registerGsapObjectBinding} from './gsapObjectBinding'
import {
  gsapClipIsOnSequence,
  listGsapClipTrackIdsOnSequence,
} from './gsapClipOnSequence'

const variant = 'default' as SequenceVariantId

function sheetStateWithGsapClip(
  objectKey: string,
  gsapAnimationId: string,
  trackId = 'track-1',
): SheetState_Historic {
  return {
    sequencesById: {
      [variant]: {
        length: 10,
        tracksByObject: {
          [objectKey]: {
            trackIdByPropPath: {},
            trackData: {
              [trackId]: {
                type: 'GsapClipTrack',
                gsapAnimationId,
                start: 0,
                duration: 1,
              },
            },
          },
        },
      },
    },
  } as SheetState_Historic
}

describe('gsapClipOnSequence', () => {
  const objectKey = 'GSAP / Box move'

  test('listGsapClipTrackIdsOnSequence ignores prop-linked tracks', () => {
    const state = {
      sequencesById: {
        [variant]: {
          length: 10,
          tracksByObject: {
            [objectKey]: {
              trackIdByPropPath: {encoded: 'linked'},
              trackData: {
                linked: {
                  type: 'GsapClipTrack',
                  gsapAnimationId: objectKey,
                  start: 0,
                  duration: 1,
                },
                free: {
                  type: 'GsapClipTrack',
                  gsapAnimationId: objectKey,
                  start: 2,
                  duration: 1,
                },
              },
            },
          },
        },
      },
    } as SheetState_Historic

    expect(
      listGsapClipTrackIdsOnSequence(state, objectKey, variant, objectKey),
    ).toEqual(['free'])
  })

  test('gsapClipIsOnSequence matches gsapAnimationId on active variant', () => {
    const sheetObject = {
      address: {
        projectId: 'p',
        sheetId: 's',
        sheetInstanceId: 'si',
        objectKey,
      },
    }
    registerGsapObjectBinding(sheetObject as never, {
      gsapAnimationId: objectKey,
      defaultDuration: 1,
    })

    const offState = {sequencesById: {}} as SheetState_Historic
    expect(gsapClipIsOnSequence(sheetObject as never, variant, offState)).toBe(
      false,
    )

    const onState = sheetStateWithGsapClip(objectKey, objectKey)
    expect(gsapClipIsOnSequence(sheetObject as never, variant, onState)).toBe(
      true,
    )
  })

  test('listGsapClipTrackIdsOnSequence returns all legacy duplicates', () => {
    const state = {
      sequencesById: {
        [variant]: {
          length: 10,
          tracksByObject: {
            [objectKey]: {
              trackIdByPropPath: {},
              trackData: {
                a: {
                  type: 'GsapClipTrack',
                  gsapAnimationId: objectKey,
                  start: 0,
                  duration: 1,
                },
                b: {
                  type: 'GsapClipTrack',
                  gsapAnimationId: objectKey,
                  start: 3,
                  duration: 1,
                },
              },
            },
          },
        },
      },
    } as SheetState_Historic

    expect(
      listGsapClipTrackIdsOnSequence(state, objectKey, variant, objectKey),
    ).toEqual(['a', 'b'])
  })
})
