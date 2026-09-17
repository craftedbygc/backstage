import {syncRegisteredGsapAnimationsForClips} from './syncGsapClipProgress'

describe('syncRegisteredGsapAnimationsForClips', () => {
  const g = globalThis as typeof globalThis & {
    __unseenco_theatre_gsap_animationRegistry__?: {
      byId: Map<string, {id: string; label: string; animation: unknown}>
    }
  }

  function setRegistry(
    entries: Record<string, {animation: unknown; targets?: unknown[]}>,
  ) {
    g.__unseenco_theatre_gsap_animationRegistry__ = {
      byId: new Map(
        Object.entries(entries).map(([id, {animation}]) => [
          id,
          {id, label: id, animation},
        ]),
      ),
    }
    for (const [id, {animation, targets}] of Object.entries(entries)) {
      if (targets) {
        ;(animation as {targets: () => unknown[]}).targets = () => targets
      }
    }
  }

  test('applies only the later clip when multiple tweens share a target', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(10, [
      {gsapAnimationId: 'show', start: 0, duration: 2},
      {gsapAnimationId: 'hide', start: 8, duration: 2},
    ])

    expect(show.progress).not.toHaveBeenCalled()
    expect(hide.progress).toHaveBeenCalledWith(1, true)
  })

  test('jumping past a single clip marks it completed', () => {
    const tween = {progress: jest.fn()}
    setRegistry({move: {animation: tween}})

    syncRegisteredGsapAnimationsForClips(50, [
      {gsapAnimationId: 'move', start: 0, duration: 2},
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
      {gsapAnimationId: 'a', start: 0, duration: 1},
      {gsapAnimationId: 'b', start: 5, duration: 1},
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
      {gsapAnimationId: 'show', start: 0, duration: 2},
      {gsapAnimationId: 'hide', start: 8, duration: 2},
    ])

    expect(hide.progress).toHaveBeenCalledWith(1, true)
    expect(show.progress).not.toHaveBeenCalled()
  })

  test('sequence end past hide start but before hide end completes hide', () => {
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(8, [
      {gsapAnimationId: 'hide', start: 8, duration: 0.35},
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
      {gsapAnimationId: 'hide', start: 8, duration: 0.35},
    ])

    expect(hide.progress).toHaveBeenCalledWith(1, true)
  })

  test('during first clip on shared target, later clip does not override', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    syncRegisteredGsapAnimationsForClips(1, [
      {gsapAnimationId: 'show', start: 0, duration: 2},
      {gsapAnimationId: 'hide', start: 8, duration: 2},
    ])

    expect(show.progress).toHaveBeenCalledWith(0.5, true)
    expect(hide.progress).not.toHaveBeenCalled()
  })
})
