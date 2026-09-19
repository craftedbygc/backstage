import type {
  SequenceEditorTree_GsapScrollTriggerChild,
  SequenceEditorTree_GsapScrollTriggerTrack,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/theatre-studio/getStudio'

const GsapScrollTriggerChildLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerChild
}> = ({leaf}) => {
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

const GsapScrollTriggerTrackLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerTrack
}> = ({leaf}) => {
  const hasChildren = leaf.children.length > 0
  if (!leaf.shouldRender) return null

  if (!hasChildren) {
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
      {leaf.children.map((child: SequenceEditorTree_GsapScrollTriggerChild) => (
        <GsapScrollTriggerChildLeftRow leaf={child} key={child.childId} />
      ))}
    </AnyCompositeRow>
  )
}

export default GsapScrollTriggerTrackLeftRow
