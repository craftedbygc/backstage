/*
 * @jest-environment jsdom
 *
 * Run with compile-time lite gates:
 *   THEATRE_LITE_TEST=1 yarn test theatre/core/src/theatreLite.test.ts
 */
import {setupTestSheet} from '@unseenco/theatre-shared/testUtils'
import {encodePathToProp} from '@unseenco/theatre-shared/utils/addresses'
import {
  asKeyframeId,
  asSequenceTrackId,
} from '@unseenco/theatre-shared/utils/ids'
import type {
  ObjectAddressKey,
  SequenceTrackId,
} from '@unseenco/theatre-shared/utils/ids'
import {iterateOver, prism} from '@unseenco/theatre-dataverse'

const describeLite =
  process.env.THEATRE_LITE_TEST === '1' ? describe : describe.skip

describeLite('@unseenco/theatre-core/core-lite value resolution', () => {
  test('ignores sequence tracks; static overrides and variants still apply', async () => {
    const {objPublicAPI, sheet} = await setupTestSheet({
      staticOverrides: {
        byObject: {
          ['obj' as ObjectAddressKey]: {
            position: {x: 42},
          },
        },
      },
      staticOverridesByVariant: {
        mobile: {
          byObject: {
            ['obj' as ObjectAddressKey]: {
              position: {x: 7},
            },
          },
        },
      },
      variantObjectOverrides: {
        mobile: ['obj' as ObjectAddressKey],
      },
      sequence: {
        type: 'PositionalSequence',
        length: 20,
        subUnitsPerUnit: 30,
        tracksByObject: {
          ['obj' as ObjectAddressKey]: {
            trackIdByPropPath: {
              [encodePathToProp(['position', 'y'])]: asSequenceTrackId('1'),
            },
            trackData: {
              ['1' as SequenceTrackId]: {
                type: 'BasicKeyframedTrack',
                keyframes: [
                  {
                    id: asKeyframeId('0'),
                    position: 0,
                    connectedRight: true,
                    handles: [0.5, 0.5, 0.5, 0.5],
                    type: 'bezier',
                    value: 99,
                  },
                ],
              },
            },
          },
        },
      },
    })

    sheet.publicApi.sequence.position = 0

    const objValues = iterateOver(prism(() => objPublicAPI.value))
    expect(objValues.next().value).toMatchObject({
      position: {x: 42, y: 0, z: 0},
    })

    sheet.publicApi.sequence.position = 10
    expect(objValues.next().value).toMatchObject({
      position: {x: 42, y: 0, z: 0},
    })

    sheet.publicApi.declareSequenceVariants(['default', 'mobile'])
    sheet.publicApi.setActiveSequenceVariant('mobile')
    expect(objValues.next().value).toMatchObject({
      position: {x: 7, y: 0, z: 0},
    })

    objValues.return()
  })

  test('sheet.sequence is inert in lite builds', async () => {
    const {sheet} = await setupTestSheet({
      staticOverrides: {byObject: {}},
    })
    const seq = sheet.publicApi.sequence
    expect(seq.position).toBe(0)
    await expect(seq.play()).resolves.toBe(true)
    expect(seq.position).toBe(0)
    seq.pause()
  })
})
