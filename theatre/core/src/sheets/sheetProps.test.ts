/*
 * @jest-environment jsdom
 */
import {getProject, types} from '@unseenco/theatre-core'
import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import {SHEET_PROPS_OBJECT_KEY} from '@unseenco/theatre-shared/utils/sheetProps'
import {setupTestSheet} from '@unseenco/theatre-shared/testUtils'

describe('sheet.props', () => {
  test('creates a hidden carrier object and excludes it from getObjects', async () => {
    const project = getProject('sheet-props-test')
    const sheet = project.sheet('Scene')
    const globals = sheet.props({brightness: types.number(1)})

    expect(globals.value.brightness).toBe(1)
    expect(sheet.getObjects()).toHaveLength(0)
    expect(privateAPI(sheet).getSheetPropsObject()?.address.objectKey).toBe(
      SHEET_PROPS_OBJECT_KEY,
    )
  })

  test('sheet.object rejects the reserved sheet props key', () => {
    const project = getProject('sheet-props-reserved-key')
    const sheet = project.sheet('Scene')
    expect(() =>
      sheet.object(SHEET_PROPS_OBJECT_KEY, {x: 0}),
    ).toThrow()
  })

  test('detachObject rejects sheet props carrier', () => {
    const project = getProject('sheet-props-detach')
    const sheet = project.sheet('Scene')
    sheet.props({x: 0})
    expect(() => sheet.detachObject(SHEET_PROPS_OBJECT_KEY)).toThrow()
  })

  test('static overrides ignore non-default sequence variants', async () => {
    const {sheet, studio} = await setupTestSheet({
      staticOverrides: {byObject: {}},
    })
    const sheetPublicAPI = sheet.publicApi
    sheetPublicAPI.declareSequenceVariants(['default', 'mobile'])
    const globals = sheetPublicAPI.props({level: types.number(0)})

    studio.transaction(({stateEditors}) => {
      const sheetState =
        stateEditors.coreByProject.historic.sheetsById._ensure({
          projectId: sheet.address.projectId,
          sheetId: sheet.address.sheetId,
        })
      sheetState.staticOverrides.byObject[SHEET_PROPS_OBJECT_KEY] = {level: 1}
      sheetState.staticOverridesByVariant ??= {}
      sheetState.staticOverridesByVariant.mobile = {
        byObject: {[SHEET_PROPS_OBJECT_KEY]: {level: 99}},
      }
    })

    sheetPublicAPI.setActiveSequenceVariant('mobile')
    expect(globals.value.level).toBe(1)
  })
})
