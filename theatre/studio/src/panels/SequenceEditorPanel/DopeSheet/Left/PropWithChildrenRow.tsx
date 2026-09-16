import type {
  SequenceEditorTree_GsapClipTrack,
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import GsapClipTrackRow from './GsapClipTrackRow'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import PrimitivePropRow from './PrimitivePropRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/theatre-studio/getStudio'

export const decideSheetObjectChildRow = (
  leaf:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_PrimitiveProp
    | SequenceEditorTree_GsapClipTrack,
): React.ReactElement => {
  if (leaf.type === 'gsapClipTrack') {
    return <GsapClipTrackRow leaf={leaf} key={'gsap-' + leaf.trackId} />
  }
  return decideRowByPropType(leaf)
}

export const decideRowByPropType = (
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp,
): React.ReactElement => {
  const key = 'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]
  return leaf.shouldRender ? (
    leaf.type === 'propWithChildren' ? (
      <PropWithChildrenRow leaf={leaf} key={key} />
    ) : (
      <PrimitivePropRow leaf={leaf} key={key} />
    )
  ) : (
    <React.Fragment key={key} />
  )
}

const PropWithChildrenRow: React.VFC<{
  leaf: SequenceEditorTree_PropWithChildren
}> = ({leaf}) => {
  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.pathToProp[leaf.pathToProp.length - 1]}
      isCollapsed={leaf.isCollapsed}
      toggleSelect={() => {
        getStudio().transaction(({stateEditors}) => {
          stateEditors.studio.historic.panels.outline.selection.set([
            leaf.sheetObject,
          ])
        })
      }}
      toggleCollapsed={() =>
        setCollapsedSheetItem(!leaf.isCollapsed, {
          sheetAddress: leaf.sheetObject.address,
          sheetItemKey: leaf.sheetItemKey,
        })
      }
    >
      {leaf.children.map((propLeaf) => decideRowByPropType(propLeaf))}
    </AnyCompositeRow>
  )
}

export default PropWithChildrenRow
