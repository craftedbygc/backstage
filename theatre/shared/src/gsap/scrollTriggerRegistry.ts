import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SheetAddress} from '@unseenco/theatre-shared/utils/addresses'
import type {SheetInstanceId} from '@unseenco/theatre-shared/utils/ids'
import {isGsapScrollTriggerSheetObjectKey} from './gsapSheetObjectKey'
import {bumpGsapStudioRegistryRevision} from './gsapStudioRegistryRevision'

const DEFAULT_SHEET_INSTANCE_ID = 'default' as SheetInstanceId
const REGISTRY_KEY = '__unseenco_theatre_gsap_scrollTriggerRegistry__'

export type GsapScrollTriggerLayout = {
  start: number
  duration: number
}

export type GsapScrollTriggerRegistryEntry = {
  id: string
  label: string
  scrollTrigger: unknown
  sheetObject?: SheetObject
  layout: GsapScrollTriggerLayout
  kind: 'tween' | 'timeline'
  animationSpanSeconds: number
  timelineChildren: GsapTimelineChildClip[]
}

type RegistryStore = {
  bySheetAddress: Map<string, Map<string, GsapScrollTriggerRegistryEntry>>
}

export function sheetAddressKey(address: SheetAddress): string {
  const sheetInstanceId = address.sheetInstanceId ?? DEFAULT_SHEET_INSTANCE_ID
  return `${address.projectId}|${address.sheetId}|${sheetInstanceId}`
}

function getStore(): RegistryStore {
  const g = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: RegistryStore
  }
  if (!g[REGISTRY_KEY]) {
    g[REGISTRY_KEY] = {bySheetAddress: new Map()}
  }
  return g[REGISTRY_KEY]!
}

function getSheetMap(key: string): Map<string, GsapScrollTriggerRegistryEntry> {
  const store = getStore()
  let map = store.bySheetAddress.get(key)
  if (!map) {
    map = new Map()
    store.bySheetAddress.set(key, map)
  }
  return map
}

export function registerScrollTriggerInRegistry(
  sheetKey: string,
  entry: GsapScrollTriggerRegistryEntry,
): void {
  getSheetMap(sheetKey).set(entry.id, entry)
  bumpGsapStudioRegistryRevision()
}

export function updateScrollTriggerLayoutInRegistry(
  sheetKey: string,
  id: string,
  patch: Pick<
    GsapScrollTriggerRegistryEntry,
    'layout' | 'timelineChildren' | 'animationSpanSeconds' | 'kind'
  >,
): void {
  const existing = getSheetMap(sheetKey).get(id)
  if (!existing) return
  getSheetMap(sheetKey).set(id, {...existing, ...patch})
  bumpGsapStudioRegistryRevision()
}

export function listScrollTriggerEntriesForSheet(
  sheetKey: string,
): GsapScrollTriggerRegistryEntry[] {
  const map = getStore().bySheetAddress.get(sheetKey)
  if (!map) return []
  return [...map.values()].sort((a, b) => a.layout.start - b.layout.start)
}

/** Whether this GSAP ScrollTrigger proxy should appear in the page-mode sequencer. */
export function isRegisteredScrollTriggerSheetObject(
  sheetObject: Pick<SheetObject, 'address'>,
): boolean {
  if (!isGsapScrollTriggerSheetObjectKey(sheetObject.address.objectKey)) {
    return false
  }
  const key = sheetAddressKey(sheetObject.address)
  return listScrollTriggerEntriesForSheet(key).some(
    (entry) =>
      entry.sheetObject?.address.objectKey === sheetObject.address.objectKey,
  )
}

export function getScrollTriggerEntry(
  sheetKey: string,
  id: string,
): GsapScrollTriggerRegistryEntry | undefined {
  return getStore().bySheetAddress.get(sheetKey)?.get(id)
}

export function clearScrollTriggerRegistryForTests(): void {
  getStore().bySheetAddress.clear()
}
