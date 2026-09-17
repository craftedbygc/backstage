import {Atom} from '@unseenco/theatre-dataverse'
import {registerGsapObjectBinding} from '@unseenco/theatre-shared/gsap/gsapObjectBinding'
import getStudio, {setStudio} from '@unseenco/theatre-studio/getStudio'
import {addGsapClipAtPlayhead} from './addGsapClipAtPlayhead'

describe('addGsapClipAtPlayhead', () => {
  const addGsapClipTrack = jest.fn()

  beforeEach(() => {
    addGsapClipTrack.mockReset()
    setStudio({
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
    const sheetObject = {
      address: {
        projectId: 'p',
        sheetId: 's',
        sheetInstanceId: 'si',
        objectKey: 'o',
      },
      sheet: {
        publicApi: {
          sequence: {
            pointer: {position: positionAtom.pointer},
          },
        },
      },
    }

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
    })
    expect(getStudio()).toBeDefined()
  })
})
