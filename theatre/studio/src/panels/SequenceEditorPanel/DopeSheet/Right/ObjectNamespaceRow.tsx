import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_ObjectNamespace} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import React from 'react'
import RightRow from './Row'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import {decideRightSheetChildRow} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'

const RightObjectNamespaceRow: React.VFC<{
  leaf: SequenceEditorTree_ObjectNamespace
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

export default RightObjectNamespaceRow
