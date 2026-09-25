import {syncRegisteredGsapAnimationsForClips} from './syncGsapClipProgress'

describe('syncRegisteredGsapAnimationsForClips', () => {
  const SHEET_KEY = 'p|s|si|gsap'

  const g = globalThis as typeof globalThis & {
    __unseenco_backstage_gsap_animationRegistry_v1__?: {
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
    g.__unseenco_backstage_gsap_animationRegistry_v1__ = {
      bySheetAddress: new Map([[SHEET_KEY, byAnim]]),
    }
    for (const [, {animation, targets}] of Object.entries(entries)) {
      if (targets) {
        ;(animation as {targets: () => unknown[]}).targets = () => targets
      }
    }
  }

  function clip(
    timing: {
      gsapAnimationId: string
      start: number
      duration: number
    },
  ) {
    return {sheetObjectAddressKey: SHEET_KEY, ...timing}
  }

  test('past hide end on shared target: all clips synced in order, hide last', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(10, [
      clip({gsapAnimationId: 'show', start: 0, duration: 2}),
      clip({gsapAnimationId: 'hide', start: 8, duration: 2}),
    ])

    expect(show.progress).toHaveBeenCalledWith(1, true)
    expect(hide.progress).toHaveBeenCalledWith(1, true)
    expect(show.progress.mock.invocationCallOrder[0]).toBeLessThan(
      hide.progress.mock.invocationCallOrder[0]!,
    )
  })

  test('jumping past a single clip marks it completed', () => {
    const tween = {progress: jest.fn()}
    setRegistry({move: {animation: tween}})

    syncRegisteredGsapAnimationsForClips(50, [
      clip({gsapAnimationId: 'move', start: 0, duration: 2}),
    ])

    expect(tween.progress).toHaveBeenCalledWith(1, true)
  })

  test('jumping past all clips on separate targets completes each', () => {
    const a = {progress: jest.fn()}
    const b = {progress: jest.fn()}
    setRegistry({
      a: {animation: a},
      b: {animation: b},
    })

    syncRegisteredGsapAnimationsForClips(100, [
      clip({gsapAnimationId: 'a', start: 0, duration: 1}),
      clip({gsapAnimationId: 'b', start: 5, duration: 1}),
    ])

    expect(a.progress).toHaveBeenCalledWith(1, true)
    expect(b.progress).toHaveBeenCalledWith(1, true)
  })

  test('at exact clip end on shared target, hide is progress 1', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(10, [
      clip({gsapAnimationId: 'show', start: 0, duration: 2}),
      clip({gsapAnimationId: 'hide', start: 8, duration: 2}),
    ])

    expect(show.progress).toHaveBeenCalledWith(1, true)
    expect(hide.progress).toHaveBeenCalledWith(1, true)
  })

  test('sequence end past hide start but before hide end completes hide', () => {
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(8, [
      clip({gsapAnimationId: 'hide', start: 8, duration: 0.35}),
    ])

    expect(hide.progress).toHaveBeenCalledWith(0, true)
  })

  test('sequence end at hide clip end completes hide', () => {
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(8.35, [
      clip({gsapAnimationId: 'hide', start: 8, duration: 0.35}),
    ])

    expect(hide.progress).toHaveBeenCalledWith(1, true)
  })

  test('back-to-back show then hide: after hide end applies hide at progress 1', () => {
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
    const positionAfterHide = hideEnd + 1e-4

    syncRegisteredGsapAnimationsForClips(positionAfterHide, [
      clip({gsapAnimationId: 'show', start: 0, duration: showDuration}),
      clip({gsapAnimationId: 'hide', start: hideStart, duration: hideDuration}),
    ])

    expect(show.progress).toHaveBeenCalledWith(1, true)
    expect(hide.progress).toHaveBeenCalledWith(1, true)
  })

  test('longer show bar after hide started: hide still wins past hide end', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(0.801, [
      clip({gsapAnimationId: 'show', start: 0, duration: 1}),
      clip({gsapAnimationId: 'hide', start: 0.45, duration: 0.35}),
    ])

    expect(show.progress).toHaveBeenCalledWith(0.801, true)
    expect(hide.progress).toHaveBeenCalledWith(1, true)
    expect(show.progress.mock.invocationCallOrder[0]).toBeLessThan(
      hide.progress.mock.invocationCallOrder[0]!,
    )
  })

  test('during first clip on shared target, hide held at 0 then show', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(1, [
      clip({gsapAnimationId: 'show', start: 0, duration: 2}),
      clip({gsapAnimationId: 'hide', start: 8, duration: 2}),
    ])

    expect(show.progress).toHaveBeenCalledWith(0.5, true)
    expect(hide.progress).toHaveBeenCalledWith(0, true)
    expect(show.progress.mock.invocationCallOrder[0]).toBeLessThan(
      hide.progress.mock.invocationCallOrder[0]!,
    )
  })

  test('click mid-show then jump past hide: stale show progress cleared', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    const clips = [
      clip({gsapAnimationId: 'show', start: 0, duration: 0.45}),
      clip({gsapAnimationId: 'hide', start: 0.45, duration: 0.35}),
    ]

    syncRegisteredGsapAnimationsForClips(0.2, clips)
    show.progress.mockClear()
    hide.progress.mockClear()

    syncRegisteredGsapAnimationsForClips(1, clips)

    expect(show.progress).toHaveBeenCalledWith(1, true)
    expect(hide.progress).toHaveBeenCalledWith(1, true)
    expect(show.progress.mock.invocationCallOrder[0]).toBeLessThan(
      hide.progress.mock.invocationCallOrder[0]!,
    )
  })
})
