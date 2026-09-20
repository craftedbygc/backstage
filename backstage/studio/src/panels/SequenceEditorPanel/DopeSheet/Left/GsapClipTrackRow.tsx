import type {SequenceEditorTree_GsapClipTrack} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import GsapChildClipLeftRow from './GsapChildClipRow'
import {setCollapsedSheetItem} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/backstage/studio/getStudio'
import type {SequenceEditorTree_GsapChildClip} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import {
  gsapKindBadgeForClipHasTimelineChildren,
  renderGsapListLabel,
} from '@unseenco/backstage/studio/gsap/GsapKindBadge'

const GsapClipTrackLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapClipTrack
}> = ({leaf}) => {
  const hasChildren = leaf.children.length > 0
  const clipKind = gsapKindBadgeForClipHasTimelineChildren(hasChildren)
  const clipLabel = renderGsapListLabel(clipKind, leaf.displayLabel)

  if (!hasChildren) {
    if (!leaf.shouldRender) return null
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={clipLabel}
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
      label={clipLabel}
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
