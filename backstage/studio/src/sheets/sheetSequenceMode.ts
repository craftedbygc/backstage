import type Sheet from '@unseenco/backstage/sheets/Sheet'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import type {SheetSequenceMode} from '@unseenco/backstage/sheets/sheetSequenceMode'

export function getSheetSequenceMode(sheet: Sheet): SheetSequenceMode {
  return sheet.getSequenceMode()
}

export function isSheetInPageMode(sheet: Sheet | undefined): boolean {
  if (!sheet) return false
  return val(sheet.sequenceModeP) === 'page'
}

export function sheetSequenceModePointer(
  sheet: Sheet,
): Pointer<SheetSequenceMode> {
  return sheet.sequenceModeP
}
