import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_GsapChildClip,
  SequenceEditorTree_GsapClipTrack,
  SequenceEditorTree_GsapScrollTriggerChild,
  SequenceEditorTree_GsapScrollTriggerTrack,
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import GsapClipTrackRow from './GsapClipTrack/GsapClipTrackRow'
import GsapChildClipTrackRow from './GsapClipTrack/GsapChildClipTrackRow'
import GsapScrollTriggerTrackRow, {
  GsapScrollTriggerChildTrackRow,
} from './GsapScrollTriggerTrack/GsapScrollTriggerTrackRow'
import {usePrism} from '@unseenco/theatre-react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import React from 'react'
import PrimitivePropRow from './PrimitivePropRow'
import RightRow from './Row'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import {
  ProvideLogger,
  useLogger,
} from '@unseenco/theatre-studio/uiComponents/useLogger'

export const decideSheetObjectChildRow = (
  leaf:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_PrimitiveProp
    | SequenceEditorTree_GsapClipTrack
    | SequenceEditorTree_GsapChildClip
    | SequenceEditorTree_GsapScrollTriggerTrack
    | SequenceEditorTree_GsapScrollTriggerChild,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): React.ReactElement => {
  if (leaf.type === 'gsapScrollTriggerChild') {
    return (
      <GsapScrollTriggerChildTrackRow
        layoutP={layoutP}
        leaf={leaf}
        key={'st-child-' + leaf.childId}
      />
    )
  }
  if (leaf.type === 'gsapScrollTriggerTrack') {
    return (
      <GsapScrollTriggerTrackRow
        layoutP={layoutP}
        leaf={leaf}
        key={'st-' + leaf.scrollTriggerId}
      />
    )
  }
  if (leaf.type === 'gsapChildClip') {
    return (
      <GsapChildClipTrackRow
        layoutP={layoutP}
        leaf={leaf}
        sequenceVariant={
          getStudioActiveSequenceVariant(leaf.sheetObject.sheet.address) ?? ''
        }
        key={'gsap-child-' + leaf.childId}
      />
    )
  }
  if (leaf.type === 'gsapClipTrack') {
    return (
      <GsapClipTrackRow
        layoutP={layoutP}
        leaf={leaf}
        key={'gsap-' + leaf.trackId}
      />
    )
  }
  return decideRowByPropType(leaf, layoutP)
}

export const decideRowByPropType = (
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): React.ReactElement =>
  leaf.type === 'propWithChildren' ? (
    <RightPropWithChildrenRow
      layoutP={layoutP}
      viewModel={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  ) : (
    <PrimitivePropRow
      layoutP={layoutP}
      leaf={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  )

const RightPropWithChildrenRow: React.VFC<{
  viewModel: SequenceEditorTree_PropWithChildren
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({viewModel, layoutP}) => {
  const logger = useLogger(
    'RightPropWithChildrenRow',
    viewModel.pathToProp.join(),
  )
  return usePrism(() => {
    const aggregatedKeyframes = collectAggregateKeyframesInPrism(viewModel)

    const node = (
      <AggregatedKeyframeTrack
        layoutP={layoutP}
        aggregatedKeyframes={aggregatedKeyframes}
        viewModel={viewModel}
      />
    )

    return (
      <ProvideLogger logger={logger}>
        <RightRow
          leaf={viewModel}
          node={node}
          isCollapsed={viewModel.isCollapsed}
        >
          {viewModel.children.map((propLeaf) =>
            decideRowByPropType(propLeaf, layoutP),
          )}
        </RightRow>
      </ProvideLogger>
    )
  }, [viewModel, layoutP])
}

export default RightPropWithChildrenRow
