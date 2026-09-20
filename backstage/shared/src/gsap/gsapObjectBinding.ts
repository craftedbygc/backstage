import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'

export type GsapObjectBinding = {
  gsapAnimationId: string
  defaultDuration: number
}

const STORE_KEY = '__unseenco_backstage_gsap_objectBindings__'

function addressKey(sheetObject: SheetObject): string {
  const a = sheetObject.address
  return `${a.projectId}|${a.sheetId}|${a.sheetInstanceId}|${a.objectKey}`
}

function getStore(): Map<string, GsapObjectBinding> {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, GsapObjectBinding>
  }
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map()
  }
  return g[STORE_KEY]!
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

export function clearGsapObjectBindingsForTests(): void {
  getStore().clear()
}
