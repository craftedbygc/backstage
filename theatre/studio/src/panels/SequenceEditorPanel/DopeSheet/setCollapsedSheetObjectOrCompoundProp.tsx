import type {StudioSheetItemKey} from '@unseenco/backstage-shared/utils/ids'
import getStudio from '@unseenco/theatre-studio/getStudio'
import type {
  SheetAddress,
  WithoutSheetInstance,
} from '@unseenco/backstage-shared/utils/addresses'

export function setCollapsedSheetItem(
  isCollapsed: boolean,
  toCollapse: {
    sheetAddress: WithoutSheetInstance<SheetAddress>
    sheetItemKey: StudioSheetItemKey
  },
) {
  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.sequenceEditorCollapsableItems.set(
      {
        ...toCollapse.sheetAddress,
        studioSheetItemKey: toCollapse.sheetItemKey,
        isCollapsed,
      },
    )
  })
}
