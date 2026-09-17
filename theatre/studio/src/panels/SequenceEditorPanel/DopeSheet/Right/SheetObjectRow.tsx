import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_SheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {sequenceEditorTreeGsapClipTrackLeafFromSheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/theatre-react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import React from 'react'
import {decideSheetObjectChildRow} from './PropWithChildrenRow'
import RightRow from './Row'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {GsapClipTrackBarForTreeLeaf} from './GsapClipTrack/GsapClipTrackRow'
import GsapChildClipTrackRow from './GsapClipTrack/GsapChildClipTrackRow'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'

const RightSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const gsapClipLeaf =
      sequenceEditorTreeGsapClipTrackLeafFromSheetObject(leaf)
    const aggregatedKeyframes = collectAggregateKeyframesInPrism(leaf)

    const node = gsapClipLeaf ? (
      <GsapClipTrackBarForTreeLeaf leaf={gsapClipLeaf} layoutP={layoutP} />
    ) : (
      <AggregatedKeyframeTrack
        layoutP={layoutP}
        aggregatedKeyframes={aggregatedKeyframes}
        viewModel={leaf}
      />
    )

    const trackVariant =
      gsapClipLeaf &&
      (leaf.sheetObject.template.getSequenceVariantOwningTrack(
        gsapClipLeaf.trackId,
        getStudioActiveSequenceVariant(leaf.sheetObject.sheet.address),
      ) ??
        getStudioActiveSequenceVariant(leaf.sheetObject.sheet.address))

    const rowIsCollapsed = gsapClipLeaf
      ? gsapClipLeaf.isCollapsed
      : leaf.isCollapsed

    return (
      <RightRow leaf={leaf} node={node} isCollapsed={rowIsCollapsed}>
        {leaf.children.map((child) => {
          if (child.type === 'gsapChildClip' && gsapClipLeaf) {
            return (
              <GsapChildClipTrackRow
                key={child.childId}
                leaf={child}
                layoutP={layoutP}
                sequenceVariant={trackVariant ?? ''}
              />
            )
          }
          return decideSheetObjectChildRow(child, layoutP)
        })}
      </RightRow>
    )
  }, [leaf, layoutP])
}

export default RightSheetObjectRow
