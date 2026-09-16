import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'

export type GsapOutlineContextMenuItem = {
  type: 'normal'
  label: string
  callback: () => void
}

type GsapOutlineContextMenuProvider = (
  sheetObject: SheetObject,
) => GsapOutlineContextMenuItem[]

const REGISTRY_KEY = '__unseenco_theatre_gsap_outlineContextMenuProvider__'

export function registerGsapOutlineContextMenuProvider(
  provider: GsapOutlineContextMenuProvider,
): () => void {
  const store = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: GsapOutlineContextMenuProvider
  }
  store[REGISTRY_KEY] = provider
  return () => {
    if (store[REGISTRY_KEY] === provider) {
      delete store[REGISTRY_KEY]
    }
  }
}

export function getGsapOutlineContextMenuItems(
  sheetObject: SheetObject,
): GsapOutlineContextMenuItem[] {
  const store = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: GsapOutlineContextMenuProvider
  }
  const provider = store[REGISTRY_KEY]
  if (!provider) return []
  return provider(sheetObject)
}
