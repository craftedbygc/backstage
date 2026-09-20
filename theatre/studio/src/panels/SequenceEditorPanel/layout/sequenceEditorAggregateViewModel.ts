import type {
  SequenceEditorTree_ObjectNamespace,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_Sheet,
  SequenceEditorTree_SheetObject,
} from './tree'
import type {SheetAddress} from '@unseenco/backstage-shared/utils/addresses'

export type SequenceEditorAggregateViewModel =
  | SequenceEditorTree_PropWithChildren
  | SequenceEditorTree_SheetObject
  | SequenceEditorTree_ObjectNamespace
  | SequenceEditorTree_Sheet

export function isSequenceEditorSheetScopedAggregateViewModel(
  viewModel: SequenceEditorAggregateViewModel,
): viewModel is SequenceEditorTree_Sheet | SequenceEditorTree_ObjectNamespace {
  return (
    viewModel.type === 'sheet' || viewModel.type === 'objectNamespace'
  )
}

export function sequenceEditorAggregateViewModelSheetAddress(
  viewModel: SequenceEditorAggregateViewModel,
): SheetAddress {
  if (viewModel.type === 'sheet') {
    return viewModel.sheet.address
  }
  if (viewModel.type === 'objectNamespace') {
    return viewModel.sheetAddress
  }
  return viewModel.sheetObject.address
}
