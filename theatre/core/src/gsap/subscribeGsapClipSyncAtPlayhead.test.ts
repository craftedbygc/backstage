import {Atom} from '@unseenco/theatre-dataverse'
import {subscribeGsapClipSyncAtPlayhead} from './subscribeGsapClipSyncAtPlayhead'

describe('subscribeGsapClipSyncAtPlayhead', () => {
  const SHEET_KEY = 'p|s|si|gsap'

  const g = globalThis as typeof globalThis & {
    __unseenco_theatre_gsap_animationRegistry__?: {
      bySheetAddress: Map<
        string,
        Map<string, {id: string; label: string; animation: unknown}>
      >
    }
  }

  function setRegistry(
    entries: Record<string, {animation: unknown; targets?: unknown[]}>,
  ) {
    const byAnim = new Map(
      Object.entries(entries).map(([id, {animation}]) => [
        id,
        {id, label: id, animation},
      ]),
    )
    g.__unseenco_theatre_gsap_animationRegistry__ = {
      bySheetAddress: new Map([[SHEET_KEY, byAnim]]),
    }
    for (const [, {animation, targets}] of Object.entries(entries)) {
      if (targets) {
        ;(animation as {targets: () => unknown[]}).targets = () => targets
      }
    }
  }

  test('click-equivalent playhead jump past hide end syncs on same turn', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    const showDuration = 0.45
    const hideStart = showDuration
    const hideDuration = 0.35
    const hideEnd = hideStart + hideDuration
    const jumpPosition = hideEnd + 0.05

    const positionAtom = new Atom({position: hideStart})
    const clips = [
      {
        sheetObjectAddressKey: SHEET_KEY,
        gsapAnimationId: 'show',
        start: 0,
        duration: showDuration,
      },
      {
        sheetObjectAddressKey: SHEET_KEY,
        gsapAnimationId: 'hide',
        start: hideStart,
        duration: hideDuration,
      },
    ]

    const untap = subscribeGsapClipSyncAtPlayhead({
      pointer: positionAtom.pointer,
      getGsapClipTimings: () => clips,
    })

    show.progress.mockClear()
    hide.progress.mockClear()

    positionAtom.setByPointer((p) => p.position, jumpPosition)

    expect(show.progress).toHaveBeenCalledWith(1, true)
    expect(hide.progress).toHaveBeenCalledWith(1, true)
    expect(show.progress.mock.invocationCallOrder[0]).toBeLessThan(
      hide.progress.mock.invocationCallOrder[0]!,
    )

    untap()
  })
})
