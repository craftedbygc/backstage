import {Atom} from '@unseenco/backstage/dataverse'
import type {SheetState_Historic} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import {registerGsapObjectBinding} from '@unseenco/backstage-shared/gsap/gsapObjectBinding'
import getStudio, {setStudio} from '@unseenco/backstage/studio/getStudio'
import {addGsapClipAtPlayhead} from './addGsapClipAtPlayhead'

function sheetObjectWithHistoric(
  overrides: Record<string, unknown> = {},
  sheetState: SheetState_Historic = {
    staticOverrides: {byObject: {}},
    sequencesById: {},
  } as unknown as SheetState_Historic,
) {
  const sheetStateAtom = new Atom(sheetState)
  return {
    address: {
      projectId: 'p',
      sheetId: 's',
      sheetInstanceId: 'si',
      objectKey: 'o',
    },
    sheet: {
      address: {projectId: 'p', sheetId: 's'},
      publicApi: {
        sequence: {
          pointer: {position: new Atom(8.12).pointer},
        },
      },
    },
    template: {
      project: {
        pointers: {
          historic: {
            sheetsById: {
              s: sheetStateAtom.pointer,
            },
          },
        },
      },
    },
    ...overrides,
  }
}

describe('addGsapClipAtPlayhead', () => {
  const addGsapClipTrack = jest.fn()

  beforeEach(() => {
    addGsapClipTrack.mockReset()
    setStudio({
      atomP: {
        historic: {
          projects: {
            stateByProjectId: {
              p: {
                stateBySheetId: {
                  s: new Atom({activeSequenceVariant: 'default'}).pointer,
                },
              },
            },
          },
        },
      },
      transaction: (fn: (ctx: {stateEditors: unknown}) => void) => {
        fn({
          stateEditors: {
            coreByProject: {
              historic: {
                sheetsById: {
                  sequence: {addGsapClipTrack},
                },
              },
            },
          },
        })
      },
    } as never)
  })

  test('uses current sequence position as clip start', () => {
    const playhead = 8.12
    const positionAtom = new Atom(playhead)
    const sheetObject = sheetObjectWithHistoric({
      sheet: {
        address: {projectId: 'p', sheetId: 's'},
        publicApi: {
          sequence: {
            pointer: {position: positionAtom.pointer},
          },
        },
      },
    })

    registerGsapObjectBinding(sheetObject as never, {
      gsapAnimationId: 'hide',
      defaultDuration: 0.35,
    })

    const ok = addGsapClipAtPlayhead(sheetObject as never)
    expect(ok).toBe(true)
    expect(addGsapClipTrack).toHaveBeenCalledWith({
      projectId: 'p',
      sheetId: 's',
      sheetInstanceId: 'si',
      objectKey: 'o',
      gsapAnimationId: 'hide',
      start: playhead,
      duration: 0.35,
      sequenceVariant: 'default',
    })
    expect(getStudio()).toBeDefined()
  })

  test('does not add when clip already exists on sequence', () => {
    const sheetObject = sheetObjectWithHistoric({}, {
      staticOverrides: {byObject: {}},
      sequencesById: {
        default: {
          length: 10,
          tracksByObject: {
            o: {
              trackIdByPropPath: {},
              trackData: {
                t1: {
                  type: 'GsapClipTrack' as const,
                  gsapAnimationId: 'hide',
                  start: 0,
                  duration: 1,
                },
              },
            },
          },
        },
      },
    } as unknown as SheetState_Historic)

    registerGsapObjectBinding(sheetObject as never, {
      gsapAnimationId: 'hide',
      defaultDuration: 0.35,
    })

    const ok = addGsapClipAtPlayhead(sheetObject as never)
    expect(ok).toBe(false)
    expect(addGsapClipTrack).not.toHaveBeenCalled()
  })
})
