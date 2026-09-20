import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {GsapTweenLike} from './gsapTypes'
import {
  clearAnimationRegistryForTests as clearSharedAnimationRegistryForTests,
  getAnimationEntry as getSharedAnimationEntry,
  getAnimationEntryForSheetObject as getSharedAnimationEntryForSheetObject,
  listAnimationEntries as listSharedAnimationEntries,
  registerAnimationInRegistry as registerSharedAnimationInRegistry,
} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import {readGsapTweenTimelineDuration} from '@unseenco/theatre-shared/gsap/syncGsapClipProgress'

export type GsapAnimationRegistryEntry = {
  id: string
  label: string
  animation: GsapTweenLike
  sheetObject?: SheetObject
  defaultDuration?: number
  onRebuildTimeline?: () => GsapTweenLike
}

export function registerAnimationInRegistry(
  entry: GsapAnimationRegistryEntry,
): void {
  registerSharedAnimationInRegistry({
    ...entry,
    animation: entry.animation,
    defaultDuration:
      entry.defaultDuration ??
      defaultClipDuration(entry.animation as GsapTweenLike),
    onRebuildTimeline: entry.onRebuildTimeline,
  })
}

function defaultClipDuration(animation: GsapTweenLike): number {
  return readGsapTweenTimelineDuration(animation)
}

function toPackageEntry(
  entry: ReturnType<typeof getSharedAnimationEntryForSheetObject>,
): GsapAnimationRegistryEntry | undefined {
  if (!entry || !entry.animation) return undefined
  return {
    id: entry.id,
    label: entry.label,
    animation: entry.animation as GsapTweenLike,
    sheetObject: entry.sheetObject,
    defaultDuration: entry.defaultDuration,
    onRebuildTimeline: entry.onRebuildTimeline as
      | (() => GsapTweenLike)
      | undefined,
  }
}

export function getAnimationEntry(
  sheetObject: SheetObject,
  animationId?: string,
): GsapAnimationRegistryEntry | undefined {
  return toPackageEntry(getSharedAnimationEntry(sheetObject, animationId))
}

export function getAnimationEntryById(
  id: string,
): GsapAnimationRegistryEntry | undefined {
  return toPackageEntry(
    listSharedAnimationEntries().find((entry) => entry.id === id),
  )
}

export function getAnimationEntryForSheetObject(
  sheetObject: SheetObject,
): GsapAnimationRegistryEntry | undefined {
  return toPackageEntry(getSharedAnimationEntryForSheetObject(sheetObject))
}

export function listAnimationEntries(): GsapAnimationRegistryEntry[] {
  return listSharedAnimationEntries()
    .filter((e): e is typeof e & {animation: GsapTweenLike} => !!e.animation)
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      animation: entry.animation as GsapTweenLike,
      sheetObject: entry.sheetObject,
    }))
}

export function clearAnimationRegistryForTests(): void {
  clearSharedAnimationRegistryForTests()
}
