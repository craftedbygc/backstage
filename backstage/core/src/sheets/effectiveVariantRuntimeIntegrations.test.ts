/*
 * @jest-environment jsdom
 */
import {getCoreTicker} from '@unseenco/backstage/coreTicker'
import {setupTestSheet} from '@unseenco/backstage-shared/testUtils'

const describeFull =
  process.env.BACKSTAGE_LITE_TEST === '1' ? describe.skip : describe

describeFull('effective sequence variant runtime integrations', () => {
  test('reattaches GSAP bridge when studio preview variant changes', async () => {
    const {sheet} = await setupTestSheet({
      staticOverrides: {byObject: {}},
      sequence: {
        type: 'PositionalSequence',
        length: 100,
        subUnitsPerUnit: 30,
        tracksByObject: {},
      },
    })

    const sheetPublic = sheet.publicApi
    sheetPublic.declareSequenceVariants(['default', 'mobile'])
    sheet.enableGsapSequenceBridge()

    const firstDisposer = sheet._gsapBridgeDisposer
    expect(firstDisposer).toBeDefined()

    sheet.setStudioPreviewVariantOverride('mobile')
    getCoreTicker().tick()

    expect(sheet._gsapBridgeDisposer).toBeDefined()
    expect(sheet._gsapBridgeDisposer).not.toBe(firstDisposer)

    sheet.setStudioPreviewVariantOverride(undefined)
    getCoreTicker().tick()

    expect(sheet._gsapBridgeDisposer).not.toBe(firstDisposer)
  })
})
