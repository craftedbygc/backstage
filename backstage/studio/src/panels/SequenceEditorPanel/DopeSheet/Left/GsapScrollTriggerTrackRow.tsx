import type {
  SequenceEditorTree_GsapScrollTriggerChild,
  SequenceEditorTree_GsapScrollTriggerTrack,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {renderGsapListLabel} from '@unseenco/backstage/studio/gsap/GsapKindBadge'
import GsapScrollTriggerChildLeftRow from './GsapScrollTriggerChildRow'

const GsapScrollTriggerTrackLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerTrack
}> = ({leaf}) => {
  const hasChildren = leaf.children.length > 0
  const stLabel = renderGsapListLabel('ST', leaf.displayLabel)
  if (!leaf.shouldRender) return null

  if (!hasChildren) {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={stLabel}
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
      label={stLabel}
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
