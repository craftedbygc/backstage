import type {GsapClipBaselineTiming} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {SheetAddress} from '@unseenco/backstage-shared/utils/addresses'
import type {
  ObjectAddressKey,
  ProjectId,
  SheetId,
  SheetInstanceId,
} from '@unseenco/backstage-shared/utils/ids'

const DEFAULT_SHEET_INSTANCE_ID = 'default' as SheetInstanceId
import {buildGsapClipBaselineTiming} from './gsapClipBaseline'
import {
  registerGsapObjectBinding,
  unregisterGsapObjectBinding,
} from './gsapObjectBinding'
import {bumpGsapStudioRegistryRevision} from './gsapStudioRegistryRevision'
import {
  introspectGsapTimelineChildren,
  isGsapTimeline,
  linkGsapTimelineChildAnimations,
} from './introspectGsapTimelineChildren'
import {readGsapTweenTimelineDuration} from './syncGsapClipProgress'
import {crossBundleSingleton} from '@unseenco/backstage-shared/utils/crossBundleSingleton'

export type GsapAnimationRegistryEntry = {
  id: string
  label: string
  /** Runtime tween; typed in `@unseenco/backstage/gsap`. */
  animation?: unknown
  sheetObject?: SheetObject
  defaultDuration?: number
  kind?: 'tween' | 'timeline'
  timelineChildById?: Map<string, unknown>
  onRebuildTimeline?: () => unknown
  /** Introspected timing at registration; fallback when clip has no baselineTiming. */
  originalTiming?: GsapClipBaselineTiming
}

type RegistryStore = {
  bySheetAddress: Map<string, Map<string, GsapAnimationRegistryEntry>>
}

export type SheetObjectAddressKeyParts = {
  projectId: ProjectId
  sheetId: SheetId
  objectKey: ObjectAddressKey
  sheetInstanceId?: SheetInstanceId
}

export function sheetObjectAddressKeyFromParts(
  address: SheetObjectAddressKeyParts,
): string {
  const sheetInstanceId = address.sheetInstanceId ?? DEFAULT_SHEET_INSTANCE_ID
  return `${address.projectId}|${address.sheetId}|${sheetInstanceId}|${address.objectKey}`
}

export function sheetObjectAddressKey(sheetObject: SheetObject): string {
  return sheetObjectAddressKeyFromParts(sheetObject.address)
}

function getStore(): RegistryStore {
  return crossBundleSingleton('gsap_animationRegistry', () => ({
    bySheetAddress: new Map(),
  }))
}

function getSheetEntryMap(
  sheetKey: string,
): Map<string, GsapAnimationRegistryEntry> {
  const store = getStore()
  let map = store.bySheetAddress.get(sheetKey)
  if (!map) {
    map = new Map()
    store.bySheetAddress.set(sheetKey, map)
  }
  return map
}

export function registerAnimationInRegistry(
  entry: GsapAnimationRegistryEntry,
): void {
  const kind =
    entry.animation && isGsapTimeline(entry.animation) ? 'timeline' : 'tween'
  const timelineChildById =
    kind === 'timeline' && entry.animation
      ? linkGsapTimelineChildAnimations(entry.animation)
      : undefined
  const defaultDuration =
    entry.defaultDuration ?? readGsapTweenTimelineDuration(entry.animation)
  const timelineChildren =
    kind === 'timeline' && entry.animation
      ? introspectGsapTimelineChildren(entry.animation)
      : []
  const originalTiming =
    entry.originalTiming ??
    (entry.animation
      ? buildGsapClipBaselineTiming({
          duration: defaultDuration,
          ...(timelineChildren.length > 0
            ? {
                timelineSpan: readGsapTweenTimelineDuration(entry.animation),
                timelineChildren,
              }
            : {}),
        })
      : undefined)
  const normalized: GsapAnimationRegistryEntry = {
    ...entry,
    kind,
    timelineChildById,
    originalTiming,
  }

  if (entry.sheetObject) {
    const sheetKey = sheetObjectAddressKey(entry.sheetObject)
    getSheetEntryMap(sheetKey).set(entry.id, normalized)
    registerGsapObjectBinding(entry.sheetObject, {
      gsapAnimationId: entry.id,
      defaultDuration,
    })
  }

  bumpGsapStudioRegistryRevision()
}

export function getAnimationEntryForAddress(
  address: SheetObjectAddressKeyParts,
  animationId?: string,
): GsapAnimationRegistryEntry | undefined {
  const animId = animationId ?? address.objectKey
  const sheetKey = sheetObjectAddressKeyFromParts(address)
  return getStore().bySheetAddress.get(sheetKey)?.get(animId)
}

export function getAnimationEntry(
  sheetObject: SheetObject,
  animationId?: string,
): GsapAnimationRegistryEntry | undefined {
  return getAnimationEntryForAddress(
    sheetObject.address,
    animationId ?? sheetObject.address.objectKey,
  )
}

/** Default registry entry for a GSAP sheet object (id defaults to `objectKey`). */
export function getAnimationEntryForSheetObject(
  sheetObject: SheetObject,
): GsapAnimationRegistryEntry | undefined {
  return getAnimationEntry(sheetObject)
}

export function getAnimationEntryBySheetAddressKey(
  sheetObjectAddressKey: string,
  animationId: string,
): GsapAnimationRegistryEntry | undefined {
  return getStore().bySheetAddress.get(sheetObjectAddressKey)?.get(animationId)
}

/** @internal Prefer sheet-scoped lookup; scans all sheets when id alone is known. */
export function getAnimationEntryById(
  id: string,
): GsapAnimationRegistryEntry | undefined {
  for (const byAnim of getStore().bySheetAddress.values()) {
    const entry = byAnim.get(id)
    if (entry) return entry
  }
  return undefined
}

export function listAnimationEntries(): GsapAnimationRegistryEntry[] {
  const entries: GsapAnimationRegistryEntry[] = []
  for (const byAnim of getStore().bySheetAddress.values()) {
    entries.push(...byAnim.values())
  }
  return entries
}

export function clearAnimationRegistryForTests(): void {
  getStore().bySheetAddress.clear()
}

function sheetAddressPrefix(address: SheetAddress): string {
  const sheetInstanceId = address.sheetInstanceId ?? DEFAULT_SHEET_INSTANCE_ID
  return `${address.projectId}|${address.sheetId}|${sheetInstanceId}|`
}

export function clearAnimationRegistryForSheetObject(
  sheetObject: SheetObject,
  animationId?: string,
): void {
  const sheetKey = sheetObjectAddressKey(sheetObject)
  const map = getStore().bySheetAddress.get(sheetKey)
  if (!map) return

  let removed = false
  if (animationId !== undefined) {
    const entry = map.get(animationId)
    if (entry?.sheetObject === sheetObject && map.delete(animationId)) {
      removed = true
    }
  } else {
    for (const [id, entry] of [...map.entries()]) {
      if (entry.sheetObject === sheetObject) {
        map.delete(id)
        removed = true
      }
    }
  }

  if (map.size === 0) {
    getStore().bySheetAddress.delete(sheetKey)
  }
  if (removed) {
    unregisterGsapObjectBinding(sheetObject)
    bumpGsapStudioRegistryRevision()
  }
}

export function unregisterAnimationOnSheet(
  address: SheetAddress,
  animationId: string,
): void {
  const prefix = sheetAddressPrefix(address)
  for (const [sheetKey, map] of getStore().bySheetAddress) {
    if (!sheetKey.startsWith(prefix)) continue
    const entry = map.get(animationId)
    if (entry?.sheetObject) {
      clearAnimationRegistryForSheetObject(entry.sheetObject, animationId)
      return
    }
  }
}

export function clearAnimationRegistryEntriesForSheetAddress(
  address: SheetAddress,
): void {
  const prefix = sheetAddressPrefix(address)
  const store = getStore()
  let removed = false
  for (const key of [...store.bySheetAddress.keys()]) {
    if (key.startsWith(prefix)) {
      store.bySheetAddress.delete(key)
      removed = true
    }
  }
  if (removed) {
    bumpGsapStudioRegistryRevision()
  }
}
