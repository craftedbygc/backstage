import type Sheet from '@unseenco/backstage/sheets/Sheet'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {isSheetInPageMode} from '@unseenco/backstage/studio/sheets/sheetSequenceMode'

/** When in page mode, scroll to match the sequence playhead (Studio scrub). */
export function syncPageScrollToSequencePosition(sheet: Sheet): void {
  if (!isSheetInPageMode(sheet)) return
  const core = getStudio()?.core
  if (!core) return
  core.syncPageScrollToSequencePosition(sheet.publicApi)
}
