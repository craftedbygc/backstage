/*
 * @jest-environment jsdom
 */
import type {ObjectAddressKey, SheetId} from '@unseenco/theatre-shared/utils/ids'
import {setupTestSheet} from '@unseenco/theatre-shared/testUtils'
import {getProject} from '@unseenco/theatre-core'
import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import getStudio from '@unseenco/theatre-studio/getStudio'
import globals from '@unseenco/theatre-shared/globals'
import type {ProjectState_Historic} from '@unseenco/theatre-core/projects/store/storeTypes'
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

  test('returns true when live historic state differs from config.state baseline', async () => {
    const savedSheetState = {
      staticOverrides: {
        byObject: {
          ['Box / 0' as ObjectAddressKey]: {
            pos: {x: 80, y: 120},
          },
        },
      },
    }
    const savedProjectState: ProjectState_Historic = {
      definitionVersion: globals.currentProjectStateDefinitionVersion,
      sheetsById: {
        ['Scene' as SheetId]: savedSheetState,
      },
      revisionHistory: ['dom-saved-state-demo'],
    }

    const projectPublic = getProject('Dom-like project ' + Date.now(), {
      state: savedProjectState,
    })
    await projectPublic.ready
    const project = privateAPI(projectPublic)

    const studio = getStudio()!
    studio.transaction(({drafts}) => {
      drafts.historic.coreByProject[project.address.projectId] = {
        ...savedProjectState,
        sheetsById: {
          ['Scene' as SheetId]: {
            staticOverrides: {
              byObject: {
                ['Box / 0' as ObjectAddressKey]: {
                  pos: {x: 200, y: 120},
                },
              },
            },
          },
        },
      }
    })

    expect(projectHasDivergedFromSavedState(project)).toBe(true)
    expect(studioHasDivergedFromSavedState()).toBe(true)
  })
})
