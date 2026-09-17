import type {GsapClipBaselineTiming} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {buildGsapClipBaselineTiming} from './gsapClipBaseline'
import {registerGsapObjectBinding} from './gsapObjectBinding'
import {bumpGsapStudioRegistryRevision} from './gsapStudioRegistryRevision'
import {
  introspectGsapTimelineChildren,
  isGsapTimeline,
  linkGsapTimelineChildAnimations,
} from './introspectGsapTimelineChildren'
import {readGsapTweenTimelineDuration} from './syncGsapClipProgress'

const REGISTRY_KEY = '__unseenco_theatre_gsap_animationRegistry__'

export type GsapAnimationRegistryEntry = {
  id: string
  label: string
  /** Runtime tween; typed in `@unseenco/theatre-gsap`. */
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
  store.byId.set(entry.id, normalized)
  if (entry.sheetObject) {
    store.idBySheetObject.set(entry.sheetObject, entry.id)
    store.idByAddressKey.set(sheetObjectAddressKey(entry.sheetObject), entry.id)
    registerGsapObjectBinding(entry.sheetObject, {
      gsapAnimationId: entry.id,
      defaultDuration,
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
