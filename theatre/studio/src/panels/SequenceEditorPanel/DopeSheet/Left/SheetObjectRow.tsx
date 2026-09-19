import type {SequenceEditorTree_SheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {decideSheetObjectChildRow} from './PropWithChildrenRow'
import GsapChildClipLeftRow from './GsapChildClipRow'
import GsapScrollTriggerChildLeftRow from './GsapScrollTriggerChildRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {createStudioSheetItemKey} from '@unseenco/theatre-shared/utils/ids'

const LeftSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  const gsapClip = leaf.gsapClip
  const gsapScrollTrigger = leaf.gsapScrollTrigger
  const hasGsapClipTimelineChildren =
    (gsapClip?.trackData.timelineChildren?.length ?? 0) > 0
  const hasScrollTriggerTimelineChildren =
    gsapScrollTrigger?.kind === 'timeline' &&
    leaf.children.some((child) => child.type === 'gsapScrollTriggerChild')
  const isCollapsed = hasGsapClipTimelineChildren
    ? gsapClip!.isCollapsed
    : hasScrollTriggerTimelineChildren
    ? gsapScrollTrigger!.isCollapsed
    : leaf.isCollapsed

  const toggleCollapsed = () => {
    if (hasGsapClipTimelineChildren && gsapClip) {
      setCollapsedSheetItem(!gsapClip.isCollapsed, {
        sheetAddress: leaf.sheetObject.address,
        sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapClipTrack(
          leaf.sheetObject,
          gsapClip.trackId,
        ),
      })
      return
    }
    if (hasScrollTriggerTimelineChildren && gsapScrollTrigger) {
      setCollapsedSheetItem(!gsapScrollTrigger.isCollapsed, {
        sheetAddress: leaf.sheetObject.address,
        sheetItemKey:
          createStudioSheetItemKey.forSheetObjectGsapScrollTriggerTrack(
            leaf.sheetObject,
            gsapScrollTrigger.scrollTriggerId,
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
        if (child.type === 'gsapScrollTriggerChild') {
          return (
            <GsapScrollTriggerChildLeftRow
              leaf={child}
              key={'st-child-' + child.childId}
            />
          )
        }
        return decideSheetObjectChildRow(child)
      })}
    </AnyCompositeRow>
  )
}

export default LeftSheetObjectRow
