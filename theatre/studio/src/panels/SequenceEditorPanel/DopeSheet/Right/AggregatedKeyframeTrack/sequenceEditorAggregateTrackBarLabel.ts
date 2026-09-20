import type {SequenceEditorAggregateViewModel} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/sequenceEditorAggregateViewModel'

export function sequenceEditorAggregateTrackBarLabel(
  viewModel: SequenceEditorAggregateViewModel,
): string {
  if (viewModel.type === 'sheet') {
    return 'Sheet'
  }
  if (viewModel.type === 'objectNamespace') {
    return viewModel.label
  }
  if (viewModel.type === 'sheetObject') {
    return viewModel.displayLabel ?? viewModel.sheetObject.address.objectKey
  }
  return (
    viewModel.propConf.label ??
    String(viewModel.pathToProp[viewModel.pathToProp.length - 1])
  )
}
