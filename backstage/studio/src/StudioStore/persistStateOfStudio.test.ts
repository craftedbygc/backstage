/*
 * @jest-environment jsdom
 */
import type {Store} from 'redux'
import type {FullStudioState} from '@unseenco/backstage/studio/store/index'
import {studioActions} from '@unseenco/backstage/studio/store'
import {
  BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX,
  persistStateOfStudio,
  THEATRE_LEGACY_PERSISTENCE_PREFIX,
} from './persistStateOfStudio'
import {
  getLegacyStorageKey,
  getProjectStorageKey,
  getStudioStorageKey,
} from './splitPersistentState'

function createTestStore(): Store<FullStudioState> & {dispatched: unknown[]} {
  const dispatched: unknown[] = []
  const state = {
    $persistent: {
      version: 1,
      studio: {},
      project: {},
    },
    historic: {coreByProject: {}, projects: {stateByProjectId: {}}, autoKey: true, panelInstanceDesceriptors: {}},
    ahistoric: {
      visibilityState: 'everythingIsVisible',
      theTrigger: {
        position: {
          closestCorner: 'bottomLeft',
          distanceFromHorizontalEdge: 0.02,
          distanceFromVerticalEdge: 0.02,
        },
      },
      coreByProject: {},
      projects: {stateByProjectId: {}},
    },
    ephemeral: {
      initialised: false,
      coreByProject: {},
      projects: {stateByProjectId: {}},
      extensions: {byId: {}},
    },
    undo: {history: {commitsByHash: {}, listOfCommitHashes: []}},
    $temps: {permanent: {}, tempActions: []},
  } as unknown as FullStudioState

  return {
    dispatched,
    getState: () => state as FullStudioState,
    dispatch: (action: unknown) => {
      dispatched.push(action)
      return action
    },
    subscribe: () => () => {},
    replaceReducer: () => {},
  } as Store<FullStudioState> & {dispatched: unknown[]}
}

describe('persistStateOfStudio theatre → backstage migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('loads split theatre-0.4 keys when backstage keys are empty', () => {
    const theatreStudio = {panelWidths: {left: 200}}
    const theatreProject = {projects: {stateByProjectId: {}}}
    localStorage.setItem(
      getStudioStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      JSON.stringify(theatreStudio),
    )
    localStorage.setItem(
      getProjectStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      JSON.stringify(theatreProject),
    )

    const store = createTestStore()
    persistStateOfStudio(store, () => {}, BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX)

    expect(
      store.dispatched.some((action) =>
        studioActions.replacePersistentState.is(action),
      ),
    ).toBe(true)
  })

  test('skips theatre migration when backstage split keys already exist', () => {
    localStorage.setItem(
      getStudioStorageKey(BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX),
      JSON.stringify({panelWidths: {left: 99}}),
    )
    localStorage.setItem(
      getStudioStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      JSON.stringify({panelWidths: {left: 1}}),
    )

    const store = createTestStore()
    persistStateOfStudio(store, () => {}, BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX)

    expect(
      localStorage.getItem(
        getStudioStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      ),
    ).not.toBeNull()
  })

  test('does not read theatre keys for a custom persistence prefix', () => {
    const custom = 'my-custom-key'
    localStorage.setItem(
      getStudioStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      JSON.stringify({panelWidths: {left: 1}}),
    )

    const store = createTestStore()
    persistStateOfStudio(store, () => {}, custom)

    expect(localStorage.getItem(getStudioStorageKey(custom))).toBeNull()
    expect(
      localStorage.getItem(
        getStudioStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      ),
    ).not.toBeNull()
  })

  test('loads combined theatre legacy .persistent key', () => {
    const legacy = {
      studio: {panelWidths: {left: 10}},
      project: {projects: {stateByProjectId: {}}},
    }
    localStorage.setItem(
      getLegacyStorageKey(THEATRE_LEGACY_PERSISTENCE_PREFIX),
      JSON.stringify(legacy),
    )

    const store = createTestStore()
    persistStateOfStudio(store, () => {}, BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX)

    expect(
      store.dispatched.some((action) =>
        studioActions.replacePersistentState.is(action),
      ),
    ).toBe(true)
  })
})
