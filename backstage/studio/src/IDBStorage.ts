import * as idb from 'idb-keyval'

const BACKSTAGE_IDB_PREFIX = 'backstagejs-'
const THEATRE_LEGACY_IDB_PREFIX = 'theatrejs-'

/**
 * Copies assets from a Theatre.js IndexedDB store into the Backstage.js store
 * when the new store is empty.
 */
export async function migrateTheatreIdbStoreIfNeeded(name: string): Promise<void> {
  const newStore = idb.createStore(
    `${BACKSTAGE_IDB_PREFIX}${name}`,
    'default-store',
  )
  const oldStore = idb.createStore(
    `${THEATRE_LEGACY_IDB_PREFIX}${name}`,
    'default-store',
  )

  const newKeys = await idb.keys(newStore)
  if (newKeys.length > 0) return

  const oldKeys = await idb.keys(oldStore)
  if (oldKeys.length === 0) return

  for (const key of oldKeys) {
    const value = await idb.get(key, oldStore)
    if (value !== undefined) {
      await idb.set(key, value, newStore)
    }
  }
}

/**
 * Custom IDB keyval storage creator. Right now this exists solely as a more convenient way to use idb-keyval with a custom db name.
 * It also automatically prefixes the provided name with `backstagejs-` to avoid conflicts with other libraries.
 *
 * @param name - The name of the database
 * @returns An object with the same methods as idb-keyval, but with a custom database name
 */
export const createStore = (name: string) => {
  const customStore = idb.createStore(
    `${BACKSTAGE_IDB_PREFIX}${name}`,
    'default-store',
  )

  return {
    set: (key: string, value: any) => idb.set(key, value, customStore),
    get: <T = any>(key: string) => idb.get<T>(key, customStore),
    del: (key: string) => idb.del(key, customStore),
    keys: <T extends IDBValidKey>() => idb.keys<T>(customStore),
    entries: <KeyType extends IDBValidKey, ValueType = any>() =>
      idb.entries<KeyType, ValueType>(customStore),
    values: <T = any>() => idb.values<T>(customStore),
  }
}
