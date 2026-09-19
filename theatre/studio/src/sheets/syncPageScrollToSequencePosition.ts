import type Sheet from '@unseenco/theatre-core/sheets/Sheet'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {isSheetInPageMode} from '@unseenco/theatre-studio/sheets/sheetSequenceMode'

/** When in page mode, scroll the document to match the sequence playhead (Studio scrub). */
export function syncPageScrollToSequencePosition(sheet: Sheet): void {
  if (!isSheetInPageMode(sheet)) return
  const core = getStudio()?.core
  if (!core) return
  core.syncNativeDocumentScrollToSequencePosition(sheet.publicApi)
}
