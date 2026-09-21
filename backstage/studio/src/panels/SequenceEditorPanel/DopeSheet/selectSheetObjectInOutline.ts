import getStudio from '@unseenco/backstage/studio/getStudio'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {SequenceEditorAggregateViewModel} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/sequenceEditorAggregateViewModel'

export function selectSheetObjectInOutline(sheetObject: SheetObject) {
  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.historic.panels.outline.selection.set([sheetObject])
  })
}

export function selectSheetObjectInOutlineForAggregateViewModel(
  viewModel: SequenceEditorAggregateViewModel,
) {
  if (
    viewModel.type === 'sheetObject' ||
    viewModel.type === 'propWithChildren'
  ) {
    selectSheetObjectInOutline(viewModel.sheetObject)
  }
}
