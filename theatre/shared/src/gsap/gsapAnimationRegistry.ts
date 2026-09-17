import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {bumpGsapStudioRegistryRevision} from './gsapStudioRegistryRevision'
import {registerGsapObjectBinding} from './gsapObjectBinding'
import {readGsapTweenTimelineDuration} from './syncGsapClipProgress'

const REGISTRY_KEY = '__unseenco_theatre_gsap_animationRegistry__'

export type GsapAnimationRegistryEntry = {
  id: string
  label: string
  /** Runtime tween; typed in `@unseenco/theatre-gsap`. */
  animation?: unknown
  sheetObject?: SheetObject
  defaultDuration?: number
}

type RegistryStore = {
  byId: Map<string, GsapAnimationRegistryEntry>
  idBySheetObject: WeakMap<SheetObject, string>
  idByAddressKey: Map<string, string>
}

export function sheetObjectAddressKey(sheetObject: SheetObject): string {
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
    const duration =
      entry.defaultDuration ?? readGsapTweenTimelineDuration(entry.animation)
    registerGsapObjectBinding(entry.sheetObject, {
      gsapAnimationId: entry.id,
      defaultDuration: duration,
    })
  }
  bumpGsapStudioRegistryRevision()
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
