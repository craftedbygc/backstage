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
    })

    expect(isRegisteredScrollTriggerSheetObject(sheetObject)).toBe(false)

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

    expect(isRegisteredScrollTriggerSheetObject(sheetObject)).toBe(true)
    expect(
      isRegisteredScrollTriggerSheetObject({
        address: {...address, objectKey: 'GSAP / Hero / Move'},
      }),
    ).toBe(false)
  })
})
