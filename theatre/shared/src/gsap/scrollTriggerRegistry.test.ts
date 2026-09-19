import {
  clearScrollTriggerRegistryForTests,
  isRegisteredScrollTriggerSheetObject,
  registerScrollTriggerInRegistry,
  sheetAddressKey,
} from './scrollTriggerRegistry'

describe('scrollTriggerRegistry', () => {
  afterEach(() => {
    clearScrollTriggerRegistryForTests()
  })

  test('isRegisteredScrollTriggerSheetObject matches registry sheetObject', () => {
    const address = {
      projectId: 'p' as const,
      sheetId: 's' as const,
      sheetInstanceId: 'default' as const,
      objectKey: 'GSAP / ScrollTrigger / Demo',
    }
    const sheetObject = {address} as {address: typeof address}
    const sheetKey = sheetAddressKey({
      projectId: address.projectId,
      sheetId: address.sheetId,
      sheetInstanceId: address.sheetInstanceId,
    } as never)

    expect(isRegisteredScrollTriggerSheetObject(sheetObject as never)).toBe(
      false,
    )

    registerScrollTriggerInRegistry(sheetKey, {
      id: 'st-1',
      label: 'Demo',
      scrollTrigger: {},
      sheetObject: sheetObject as never,
      layout: {start: 10, duration: 20},
      kind: 'tween',
      animationSpanSeconds: 1,
      timelineChildren: [],
    })

    expect(isRegisteredScrollTriggerSheetObject(sheetObject as never)).toBe(
      true,
    )
    expect(
      isRegisteredScrollTriggerSheetObject({
        address: {...address, objectKey: 'GSAP / Hero / Move'},
      } as never),
    ).toBe(false)
  })

  test('registerScrollTriggerInRegistry rejects duplicate instance', () => {
    const sheetKey = 'p|s|default'
    const st = {start: 0, end: 1}
    const entry = {
      id: 'a',
      label: 'A',
      scrollTrigger: st,
      layout: {start: 0, duration: 10},
      kind: 'tween' as const,
      animationSpanSeconds: 1,
      timelineChildren: [],
    }
    expect(registerScrollTriggerInRegistry(sheetKey, entry)).toBe('registered')
    expect(registerScrollTriggerInRegistry(sheetKey, {...entry, id: 'b'})).toBe(
      'duplicate',
    )
  })
})
