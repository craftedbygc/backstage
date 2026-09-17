import {Atom} from '@unseenco/theatre-dataverse'
import {subscribeGsapClipSyncAtPlayhead} from './subscribeGsapClipSyncAtPlayhead'

describe('subscribeGsapClipSyncAtPlayhead', () => {
  const g = globalThis as typeof globalThis & {
    __unseenco_theatre_gsap_animationRegistry__?: {
      byId: Map<string, {id: string; label: string; animation: unknown}>
    }
  }

  test('click-equivalent playhead jump past hide end syncs on same turn', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    g.__unseenco_theatre_gsap_animationRegistry__ = {
      byId: new Map([
        ['show', {id: 'show', label: 'show', animation: show}],
        ['hide', {id: 'hide', label: 'hide', animation: hide}],
      ]),
    }
    ;(show as {targets: () => unknown[]}).targets = () => [panel]
    ;(hide as {targets: () => unknown[]}).targets = () => [panel]

    const showDuration = 0.45
    const hideStart = showDuration
    const hideDuration = 0.35
    const hideEnd = hideStart + hideDuration
    const jumpPosition = hideEnd + 0.05

    const positionAtom = new Atom({position: hideStart})
    const clips = [
      {gsapAnimationId: 'show', start: 0, duration: showDuration},
      {gsapAnimationId: 'hide', start: hideStart, duration: hideDuration},
    ]

    const untap = subscribeGsapClipSyncAtPlayhead({
      pointer: positionAtom.pointer,
      getGsapClipTimings: () => clips,
    })

    show.progress.mockClear()
    hide.progress.mockClear()

    positionAtom.setByPointer((p) => p.position, jumpPosition)

    expect(hide.progress).toHaveBeenCalledWith(1, true)
    expect(show.progress).not.toHaveBeenCalled()

    untap()
  })
})
