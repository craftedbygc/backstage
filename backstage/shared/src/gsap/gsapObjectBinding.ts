import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {crossBundleSingleton} from '@unseenco/backstage-shared/utils/crossBundleSingleton'

export type GsapObjectBinding = {
  gsapAnimationId: string
  defaultDuration: number
}

function addressKey(sheetObject: SheetObject): string {
  const a = sheetObject.address
  return `${a.projectId}|${a.sheetId}|${a.sheetInstanceId}|${a.objectKey}`
}

function getStore(): Map<string, GsapObjectBinding> {
  return crossBundleSingleton('gsap_objectBindings', () => new Map())
}

export function registerGsapObjectBinding(
  sheetObject: SheetObject,
  binding: GsapObjectBinding,
): void {
  getStore().set(addressKey(sheetObject), binding)
}

export function getGsapObjectBinding(
  sheetObject: SheetObject,
): GsapObjectBinding | undefined {
  return getStore().get(addressKey(sheetObject))
}

export function unregisterGsapObjectBinding(sheetObject: SheetObject): void {
  getStore().delete(addressKey(sheetObject))
}

export function clearGsapObjectBindingsForTests(): void {
  getStore().clear()
}
