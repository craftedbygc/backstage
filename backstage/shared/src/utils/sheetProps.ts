import type {ObjectAddressKey} from './ids'

/**
 * Reserved object key for sheet-level props (internal carrier object).
 * Not returned from {@link ISheet.getObjects} and hidden from the Studio outline.
 */
export const SHEET_PROPS_OBJECT_KEY =
  '__backstage_sheet_props__' as ObjectAddressKey

export function isSheetPropsObjectKey(
  objectKey: string,
): objectKey is typeof SHEET_PROPS_OBJECT_KEY {
  return objectKey === SHEET_PROPS_OBJECT_KEY
}

/** User-facing namespace for detail-panel prop tooltips (sheet name for sheet props). */
export function sheetObjectPropsTooltipNamespace(
  objectKey: string,
  sheetId: string,
): string {
  return isSheetPropsObjectKey(objectKey) ? sheetId : objectKey
}
