import type {SequenceEditorTree_GsapClipTrack} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import GsapChildClipLeftRow from './GsapChildClipRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/theatre-studio/getStudio'
import type {SequenceEditorTree_GsapChildClip} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'

const GsapClipTrackLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapClipTrack
}> = ({leaf}) => {
  const hasChildren = leaf.children.length > 0

  if (!hasChildren) {
    if (!leaf.shouldRender) return null
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.displayLabel}
        isCollapsed={false}
        toggleSelect={() => {
          getStudio().transaction(({stateEditors}) => {
            stateEditors.studio.historic.panels.outline.selection.set([
              leaf.sheetObject,
            ])
          })
        }}
        toggleCollapsed={() => {}}
      />
    )
  }

  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.displayLabel}
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
      {leaf.children.map((child: SequenceEditorTree_GsapChildClip) => (
        <GsapChildClipLeftRow leaf={child} key={child.childId} />
      ))}
    </AnyCompositeRow>
  )
}

export default GsapClipTrackLeftRow
