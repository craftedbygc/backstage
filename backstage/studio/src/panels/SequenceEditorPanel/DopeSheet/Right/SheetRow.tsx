import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_Sheet} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import React from 'react'
import {decideRightSheetChildRow} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'
import RightRow from './Row'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'

const SheetRow: React.FC<{
  leaf: SequenceEditorTree_Sheet
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const childRows = leaf.children.map((child) =>
      decideRightSheetChildRow(child, layoutP),
    )

    if (!leaf.shouldRender) {
      return <>{childRows}</>
    }

    const aggregatedKeyframes = collectAggregateKeyframesInPrism(leaf)

    const node = (
      <AggregatedKeyframeTrack
        layoutP={layoutP}
        aggregatedKeyframes={aggregatedKeyframes}
        viewModel={leaf}
      />
    )

    return (
      <RightRow
        layoutP={layoutP}
        leaf={leaf}
        node={node}
        isCollapsed={leaf.isCollapsed}
      >
        {childRows}
      </RightRow>
    )
  }, [leaf, layoutP])
}

export default SheetRow
