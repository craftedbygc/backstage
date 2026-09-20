import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_Sheet} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import React from 'react'
import {decideRightSheetChildRow} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'
import RightRow from './Row'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'

const SheetRow: React.FC<{
  leaf: SequenceEditorTree_Sheet
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const aggregatedKeyframes = collectAggregateKeyframesInPrism(leaf)

    const node = (
      <AggregatedKeyframeTrack
        layoutP={layoutP}
        aggregatedKeyframes={aggregatedKeyframes}
        viewModel={leaf}
      />
    )

    return (
      <RightRow leaf={leaf} node={node} isCollapsed={leaf.isCollapsed}>
        {leaf.children.map((child) => decideRightSheetChildRow(child, layoutP))}
      </RightRow>
    )
  }, [leaf, layoutP])
}

export default SheetRow
