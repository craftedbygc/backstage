import logger from '@unseenco/backstage-shared/logger'
import type {StudioPersistentState} from '@unseenco/backstage/studio/store'
import {studioActions} from '@unseenco/backstage/studio/store'
import type {FullStudioState} from '@unseenco/backstage/studio/store/index'
import debounce from 'lodash-es/debounce'
import type {Store} from 'redux'
import {
  getLegacyStorageKey,
  getProjectStorageKey,
  getStudioStorageKey,
  mergePersistentState,
  splitPersistentState,
  type ProjectOnlyPersistentState,
  type StudioOnlyPersistentState,
} from './splitPersistentState'

type LastPersistedSplit = {
  studio: StudioOnlyPersistentState
  project: ProjectOnlyPersistentState
}

const lastStateByStore = new WeakMap<
  Store<FullStudioState>,
  LastPersistedSplit
>()

/** Default Studio `persistenceKey` in {@link Studio.initialize}. */
export const BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX = 'backstage-0.4'

/** Theatre.js 0.4 localStorage prefix migrated on first load. */
export const THEATRE_LEGACY_PERSISTENCE_PREFIX = 'theatre-0.4'

export const persistStateOfStudio = (
  reduxStore: Store<FullStudioState>,
  onInitialize: () => void,
  localStoragePrefix: string,
) => {
  const loadState = (s: StudioPersistentState) => {
    reduxStore.dispatch(studioActions.replacePersistentState(s))
  }

  const studioStorageKey = getStudioStorageKey(localStoragePrefix)
  const projectStorageKey = getProjectStorageKey(localStoragePrefix)
  const legacyStorageKey = getLegacyStorageKey(localStoragePrefix)
  const getState = () => reduxStore.getState().$persistent

  loadFromPersistentStorage()

  const persist = () => {
    const newState = getState()
    const {studio, project} = splitPersistentState(newState)
    const lastState = lastStateByStore.get(reduxStore)
    if (
      lastState &&
      lastState.studio === studio &&
      lastState.project === project
    ) {
      return
    }
    lastStateByStore.set(reduxStore, {studio, project})
    localStorage.setItem(studioStorageKey, JSON.stringify(studio))
    localStorage.setItem(projectStorageKey, JSON.stringify(project))
  }
  reduxStore.subscribe(debounce(persist, 1000))
  if (window) {
    window.addEventListener('beforeunload', persist)
  }

  function loadFromPersistentStorage() {
    try {
      const studioState = loadJsonFromStorage<StudioOnlyPersistentState>(
        studioStorageKey,
      )
      const projectState = loadJsonFromStorage<ProjectOnlyPersistentState>(
        projectStorageKey,
      )

      if (studioState || projectState) {
        const merged = mergePersistentState(studioState, projectState)
        if (merged) {
          loadState(merged)
        }
      } else {
        const legacyState = loadJsonFromStorage<StudioPersistentState>(
          legacyStorageKey,
        )
        if (legacyState) {
          loadState(legacyState)
          const {studio, project} = splitPersistentState(legacyState)
          localStorage.setItem(studioStorageKey, JSON.stringify(studio))
          localStorage.setItem(projectStorageKey, JSON.stringify(project))
          localStorage.removeItem(legacyStorageKey)
        } else if (
          localStoragePrefix === BACKSTAGE_DEFAULT_PERSISTENCE_PREFIX
        ) {
          loadTheatreJs040PersistentState()
        }
      }
    } finally {
      onInitialize()
    }
  }

  function loadTheatreJs040PersistentState() {
    const theatreStudioKey = getStudioStorageKey(
      THEATRE_LEGACY_PERSISTENCE_PREFIX,
    )
    const theatreProjectKey = getProjectStorageKey(
      THEATRE_LEGACY_PERSISTENCE_PREFIX,
    )
    const theatreStudio = loadJsonFromStorage<StudioOnlyPersistentState>(
      theatreStudioKey,
    )
    const theatreProject = loadJsonFromStorage<ProjectOnlyPersistentState>(
      theatreProjectKey,
    )

    if (theatreStudio || theatreProject) {
      const merged = mergePersistentState(theatreStudio, theatreProject)
      if (merged) {
        loadState(merged)
      }
      return
    }

    const theatreLegacyKey = getLegacyStorageKey(
      THEATRE_LEGACY_PERSISTENCE_PREFIX,
    )
    const theatreLegacy = loadJsonFromStorage<StudioPersistentState>(
      theatreLegacyKey,
    )
    if (theatreLegacy) {
      loadState(theatreLegacy)
    }
  }
}

function loadJsonFromStorage<T>(storageKey: string): T | null {
  const persistedS = localStorage.getItem(storageKey)
  if (!persistedS) return null

  try {
    return JSON.parse(persistedS) as T
  } catch (e) {
    logger.warn(
      `Could not parse Backstage's persisted state at "${storageKey}". This must be a bug. Please report it.`,
    )
    return null
  }
}

export const __experimental_clearPersistentStorage = (
  reduxStore: Store<FullStudioState>,
  localStoragePrefix: string,
) => {
  __experimental_clearStudioPersistentStorage(reduxStore, localStoragePrefix)
  __experimental_clearProjectPersistentStorage(reduxStore, localStoragePrefix)
}

export const __experimental_clearStudioPersistentStorage = (
  reduxStore: Store<FullStudioState>,
  localStoragePrefix: string,
) => {
  const storageKey = getStudioStorageKey(localStoragePrefix)
  const currentState = reduxStore.getState().$persistent
  const {studio, project} = splitPersistentState(currentState)
  localStorage.removeItem(storageKey)
  localStorage.removeItem(getLegacyStorageKey(localStoragePrefix))
  lastStateByStore.set(reduxStore, {studio, project})
}

export const __experimental_clearProjectPersistentStorage = (
  reduxStore: Store<FullStudioState>,
  localStoragePrefix: string,
) => {
  const storageKey = getProjectStorageKey(localStoragePrefix)
  const currentState = reduxStore.getState().$persistent
  const {studio, project} = splitPersistentState(currentState)
  localStorage.removeItem(storageKey)
  localStorage.removeItem(getLegacyStorageKey(localStoragePrefix))
  lastStateByStore.set(reduxStore, {studio, project})
}
