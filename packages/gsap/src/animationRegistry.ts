import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {GsapTweenLike} from './gsapTypes'

const REGISTRY_KEY = '__unseenco_theatre_gsap_animationRegistry__'

export type GsapAnimationRegistryEntry = {
  id: string
  label: string
  animation: GsapTweenLike
  sheetObject?: SheetObject
}

type RegistryStore = {
  byId: Map<string, GsapAnimationRegistryEntry>
  idBySheetObject: WeakMap<SheetObject, string>
  /** Stable lookup when WeakMap identity differs across bundles/HMR. */
  idByAddressKey: Map<string, string>
}

function sheetObjectAddressKey(sheetObject: SheetObject): string {
  const a = sheetObject.address
  return `${a.projectId}|${a.sheetId}|${a.sheetInstanceId}|${a.objectKey}`
}

function getStore(): RegistryStore {
  const g = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: RegistryStore
  }
  if (!g[REGISTRY_KEY]) {
    g[REGISTRY_KEY] = {
      byId: new Map(),
      idBySheetObject: new WeakMap(),
      idByAddressKey: new Map(),
    }
  }
  return g[REGISTRY_KEY]!
}

export function registerAnimationInRegistry(
  entry: GsapAnimationRegistryEntry,
): void {
  const store = getStore()
  store.byId.set(entry.id, entry)
  if (entry.sheetObject) {
    store.idBySheetObject.set(entry.sheetObject, entry.id)
    store.idByAddressKey.set(sheetObjectAddressKey(entry.sheetObject), entry.id)
  }
}

export function getAnimationEntryById(
  id: string,
): GsapAnimationRegistryEntry | undefined {
  return getStore().byId.get(id)
}

export function getAnimationEntryForSheetObject(
  sheetObject: SheetObject,
): GsapAnimationRegistryEntry | undefined {
  const store = getStore()
  const fromWeak = store.idBySheetObject.get(sheetObject)
  const id =
    fromWeak ?? store.idByAddressKey.get(sheetObjectAddressKey(sheetObject))
  if (!id) return undefined
  return store.byId.get(id)
}

export function listAnimationEntries(): GsapAnimationRegistryEntry[] {
  return [...getStore().byId.values()]
}

export function clearAnimationRegistryForTests(): void {
  const store = getStore()
  store.byId.clear()
  store.idByAddressKey.clear()
}
