import type Sheet from '@unseenco/theatre-core/sheets/Sheet'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import type {SheetSequenceMode} from '@unseenco/theatre-core/sheets/sheetSequenceMode'

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
