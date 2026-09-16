import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {GsapTweenLike} from './gsapTypes'
import {
  clearAnimationRegistryForTests as clearSharedAnimationRegistryForTests,
  getAnimationEntryById as getSharedAnimationEntryById,
  getAnimationEntryForSheetObject as getSharedAnimationEntryForSheetObject,
  listAnimationEntries as listSharedAnimationEntries,
  registerAnimationInRegistry as registerSharedAnimationInRegistry,
} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'

export type GsapAnimationRegistryEntry = {
  id: string
  label: string
  animation: GsapTweenLike
  sheetObject?: SheetObject
  defaultDuration?: number
}

export function registerAnimationInRegistry(
  entry: GsapAnimationRegistryEntry,
): void {
  registerSharedAnimationInRegistry({
    ...entry,
    animation: entry.animation,
    defaultDuration:
      entry.defaultDuration ?? defaultClipDuration(entry.animation),
  })
}

function defaultClipDuration(animation: GsapTweenLike): number {
  const d = animation.duration()
  return d > 0 ? d : 1
}

export function getAnimationEntryById(
  id: string,
): GsapAnimationRegistryEntry | undefined {
  const entry = getSharedAnimationEntryById(id)
  if (!entry || !entry.animation) return undefined
  return {
    id: entry.id,
    label: entry.label,
    animation: entry.animation as GsapTweenLike,
    sheetObject: entry.sheetObject,
  }
}

export function getAnimationEntryForSheetObject(
  sheetObject: SheetObject,
): GsapAnimationRegistryEntry | undefined {
  const entry = getSharedAnimationEntryForSheetObject(sheetObject)
  if (!entry || !entry.animation) return undefined
  return {
    id: entry.id,
    label: entry.label,
    animation: entry.animation as GsapTweenLike,
    sheetObject: entry.sheetObject,
  }
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
