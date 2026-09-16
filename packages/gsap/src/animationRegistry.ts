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
}

function getStore(): RegistryStore {
  const g = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: RegistryStore
  }
  if (!g[REGISTRY_KEY]) {
    g[REGISTRY_KEY] = {
      byId: new Map(),
      idBySheetObject: new WeakMap(),
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
  const id = getStore().idBySheetObject.get(sheetObject)
  if (!id) return undefined
  return getStore().byId.get(id)
}

export function listAnimationEntries(): GsapAnimationRegistryEntry[] {
  return [...getStore().byId.values()]
}

export function clearAnimationRegistryForTests(): void {
  getStore().byId.clear()
}
