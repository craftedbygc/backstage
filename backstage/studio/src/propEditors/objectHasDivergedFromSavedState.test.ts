/*
 * @jest-environment jsdom
 */
import type {ObjectAddressKey} from '@unseenco/backstage-shared/utils/ids'
import {setupTestSheet} from '@unseenco/backstage-shared/testUtils'
import {getPropConfigByPath} from '@unseenco/backstage-shared/propTypes/utils'
import {objectHasDivergedFromSavedState} from './objectHasDivergedFromSavedState'
import {revertPropToSavedState} from './revertPropToSavedState'

const emptySheetState = {
  staticOverrides: {byObject: {}},
}

describe('objectHasDivergedFromSavedState', () => {
  test('returns false when in-memory state matches the loaded json state', async () => {
    const sheetState = {
      staticOverrides: {
        byObject: {
          ['obj' as ObjectAddressKey]: {
            position: {x: 10},
          },
        },
      },
    }
    const {obj} = await setupTestSheet(sheetState)

    expect(objectHasDivergedFromSavedState(obj)).toBe(false)
  })

  test('returns true when a static prop differs from the loaded json state', async () => {
    const {studio, obj, objPublicAPI} = await setupTestSheet(emptySheetState)

    studio.transaction(({set}) => {
      set(objPublicAPI.props.position.x, 42)
    })

    expect(objectHasDivergedFromSavedState(obj)).toBe(true)
  })

  test('stays true after commit because the loaded json state is unchanged', async () => {
    const {studio, obj, objPublicAPI} = await setupTestSheet(emptySheetState)

    studio.transaction(({set}) => {
      set(objPublicAPI.props.position.x, 42)
    })

    expect(objectHasDivergedFromSavedState(obj)).toBe(true)
  })

  test('returns false after reverting a prop that has no saved json override', async () => {
    const {studio, obj, objPublicAPI} = await setupTestSheet(emptySheetState)
    const pathToProp = ['position', 'x']
    const propConfig = getPropConfigByPath(
      obj.template.staticConfig,
      pathToProp,
    )!

    studio.transaction(({set}) => {
      set(objPublicAPI.props.position.x, 42)
    })

    expect(objectHasDivergedFromSavedState(obj)).toBe(true)

    studio.transaction(({stateEditors}) => {
      revertPropToSavedState(stateEditors, obj, pathToProp, propConfig)
    })

    expect(objectHasDivergedFromSavedState(obj)).toBe(false)
  })

  test('returns true when a sequence track is added for the object', async () => {
    const {studio, obj} = await setupTestSheet(emptySheetState)
    const pathToProp = ['position', 'x']
    const propConfig = getPropConfigByPath(
      obj.template.staticConfig,
      pathToProp,
    )!

    studio.transaction(({stateEditors}) => {
      stateEditors.coreByProject.historic.sheetsById.sequence.setPrimitivePropAsSequenced(
        {
          ...obj.address,
          pathToProp,
        },
        propConfig,
      )
    })

    expect(objectHasDivergedFromSavedState(obj)).toBe(true)
  })
})
