import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {SheetAddress} from '@unseenco/backstage-shared/utils/addresses'
import {
  clearAnimationRegistryEntriesForSheetAddress,
  clearAnimationRegistryForSheetObject,
} from './gsapAnimationRegistry'
import {
  clearScrollTriggerRegistryForSheetAddress,
  clearScrollTriggerRegistryForSheetObject,
} from './scrollTriggerRegistry'

export function clearGsapRegistriesForSheetObject(
  sheetObject: SheetObject,
): void {
  clearAnimationRegistryForSheetObject(sheetObject)
  clearScrollTriggerRegistryForSheetObject(sheetObject)
}

export function clearGsapRegistriesForSheetAddress(
  address: SheetAddress,
): void {
  clearAnimationRegistryEntriesForSheetAddress(address)
  clearScrollTriggerRegistryForSheetAddress(address)
}
