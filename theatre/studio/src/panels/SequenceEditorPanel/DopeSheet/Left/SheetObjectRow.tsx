import type {SequenceEditorTree_SheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {decideSheetObjectChildRow} from './PropWithChildrenRow'
import GsapChildClipLeftRow from './GsapChildClipRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {createStudioSheetItemKey} from '@unseenco/theatre-shared/utils/ids'

const LeftSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  const gsapClip = leaf.gsapClip
  const hasTimelineChildren =
    (gsapClip?.trackData.timelineChildren?.length ?? 0) > 0
  const isCollapsed =
    hasTimelineChildren && gsapClip ? gsapClip.isCollapsed : leaf.isCollapsed

  const toggleCollapsed = () => {
    if (hasTimelineChildren && gsapClip) {
      setCollapsedSheetItem(!gsapClip.isCollapsed, {
        sheetAddress: leaf.sheetObject.address,
        sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapClipTrack(
          leaf.sheetObject,
          gsapClip.trackId,
        ),
      })
      return
    }
    setCollapsedSheetItem(!leaf.isCollapsed, {
      sheetAddress: leaf.sheetObject.address,
      sheetItemKey: leaf.sheetItemKey,
    })
  }

  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.displayLabel ?? leaf.sheetObject.address.objectKey}
      isCollapsed={isCollapsed}
      toggleSelect={() => {
        // set selection to this sheet object on click
        getStudio().transaction(({stateEditors}) => {
          stateEditors.studio.historic.panels.outline.selection.set([
            leaf.sheetObject,
          ])
        })
      }}
      toggleCollapsed={toggleCollapsed}
    >
      {leaf.children.map((child) => {
        if (child.type === 'gsapChildClip') {
          return <GsapChildClipLeftRow leaf={child} key={child.childId} />
        }
        return decideSheetObjectChildRow(child)
      })}
    </AnyCompositeRow>
  )
}

export default LeftSheetObjectRow
