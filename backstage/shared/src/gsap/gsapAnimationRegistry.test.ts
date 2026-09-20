import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {
  clearAnimationRegistryForTests,
  getAnimationEntry,
  getAnimationEntryBySheetAddressKey,
  registerAnimationInRegistry,
  sheetObjectAddressKeyFromParts,
} from './gsapAnimationRegistry'

describe('gsapAnimationRegistry', () => {
  afterEach(() => {
    clearAnimationRegistryForTests()
  })

  const sheetObject = {
    address: {
      projectId: 'p',
      sheetId: 's',
      sheetInstanceId: 'si',
      objectKey: 'GSAP / Panel show',
    },
  } as SheetObject

  const mockAnimation = () => ({
    pause: jest.fn(),
    duration: () => 1,
  })

  test('stores entries scoped by sheet address and animation id', () => {
    registerAnimationInRegistry({
      id: 'GSAP / Panel show',
      label: 'Panel show',
      animation: mockAnimation(),
      sheetObject,
    })

    const sheetKey = sheetObjectAddressKeyFromParts(sheetObject.address)
    expect(
      getAnimationEntryBySheetAddressKey(sheetKey, 'GSAP / Panel show')?.label,
    ).toBe('Panel show')
    expect(getAnimationEntry(sheetObject)?.id).toBe('GSAP / Panel show')
  })

  test('supports explicit id override on the same sheet object', () => {
    registerAnimationInRegistry({
      id: 'custom-id',
      label: 'Panel show',
      animation: mockAnimation(),
      sheetObject,
    })

    expect(getAnimationEntry(sheetObject, 'custom-id')?.id).toBe('custom-id')
    expect(getAnimationEntry(sheetObject, 'GSAP / Panel show')).toBeUndefined()
  })
})
