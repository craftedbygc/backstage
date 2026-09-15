/*
 * @jest-environment jsdom
 */
import {setupTestSheet} from '@unseenco/theatre-shared/testUtils'
import {
  projectHasDivergedFromSavedState,
  studioHasDivergedFromSavedState,
} from './projectHasDivergedFromSavedState'

const emptySheetState = {
  staticOverrides: {byObject: {}},
}

describe('projectHasDivergedFromSavedState', () => {
  test('returns false when in-memory state matches the loaded json state', async () => {
    const {obj} = await setupTestSheet(emptySheetState)

    expect(projectHasDivergedFromSavedState(obj.template.project)).toBe(false)
    expect(studioHasDivergedFromSavedState()).toBe(false)
  })

  test('returns true when a prop is modified from the loaded json state', async () => {
    const {obj, objPublicAPI, studio} = await setupTestSheet(emptySheetState)

    studio.transaction(({set}) => {
      set(objPublicAPI.props.position.x, 42)
    })

    expect(projectHasDivergedFromSavedState(obj.template.project)).toBe(true)
    expect(studioHasDivergedFromSavedState()).toBe(true)
  })
})
