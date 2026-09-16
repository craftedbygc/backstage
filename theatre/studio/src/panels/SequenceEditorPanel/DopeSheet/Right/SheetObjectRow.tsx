import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_SheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/theatre-react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import React from 'react'
import {decideSheetObjectChildRow} from './PropWithChildrenRow'
import RightRow from './Row'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'

const RightSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
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
        {leaf.children.map((child) =>
          decideSheetObjectChildRow(child, layoutP),
        )}
      </RightRow>
    )
  }, [leaf, layoutP])
}

export default RightSheetObjectRow
