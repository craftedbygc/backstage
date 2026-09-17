import {syncRegisteredGsapAnimationsForClips} from './syncGsapClipProgress'

describe('syncRegisteredGsapAnimationsForClips', () => {
  test('does not re-apply finished clips past their end', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}

    const g = globalThis as typeof globalThis & {
      __unseenco_theatre_gsap_animationRegistry__?: {
        byId: Map<string, {id: string; label: string; animation: unknown}>
      }
    }
    g.__unseenco_theatre_gsap_animationRegistry__ = {
      byId: new Map([
        ['show', {id: 'show', label: 'show', animation: show}],
        ['hide', {id: 'hide', label: 'hide', animation: hide}],
      ]),
    }

    syncRegisteredGsapAnimationsForClips(10, [
      {gsapAnimationId: 'show', start: 0, duration: 2},
      {gsapAnimationId: 'hide', start: 8, duration: 2},
    ])

    expect(show.progress).not.toHaveBeenCalled()
    expect(hide.progress).toHaveBeenCalledWith(1, true)
  })
})
