import type {GsapTweenLike} from './gsapTypes'
import {
  clearAnimationRegistryForTests,
  getAnimationEntryById,
  registerAnimationInRegistry,
} from './animationRegistry'

describe('animationRegistry', () => {
  afterEach(() => {
    clearAnimationRegistryForTests()
  })

  test('stores entries by id', () => {
    const animation = {
      pause: jest.fn(),
      progress: jest.fn(),
      duration: () => 1,
    } as GsapTweenLike
    registerAnimationInRegistry({
      id: 'anim-1',
      label: 'Intro',
      animation,
    })
    expect(getAnimationEntryById('anim-1')?.label).toBe('Intro')
  })
})
