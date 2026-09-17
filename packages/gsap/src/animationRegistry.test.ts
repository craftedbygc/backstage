import type {GsapTweenLike} from './gsapTypes'
import {
  clearAnimationRegistryForTests,
  getAnimationEntry,
  registerAnimationInRegistry,
} from './animationRegistry'

describe('animationRegistry', () => {
  afterEach(() => {
    clearAnimationRegistryForTests()
  })

  test('stores entries scoped to sheet object', () => {
    const animation = {
      pause: jest.fn(),
      progress: jest.fn(),
      duration: () => 1,
    } as GsapTweenLike
    const sheetObject = {
      address: {
        projectId: 'p',
        sheetId: 's',
        sheetInstanceId: 'si',
        objectKey: 'GSAP / Intro',
      },
    } as never

    registerAnimationInRegistry({
      id: 'GSAP / Intro',
      label: 'Intro',
      animation,
      sheetObject,
    })
    expect(getAnimationEntry(sheetObject, 'GSAP / Intro')?.label).toBe('Intro')
  })
})
