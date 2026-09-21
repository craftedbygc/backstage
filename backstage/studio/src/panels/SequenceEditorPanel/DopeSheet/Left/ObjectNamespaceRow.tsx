import type {SequenceEditorTree_ObjectNamespace} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@unseenco/backstage/dataverse'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import {decideLeftSheetChildRow} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'

const LeftObjectNamespaceRow: React.VFC<{
  leaf: SequenceEditorTree_ObjectNamespace
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.label}
      isCollapsed={leaf.isCollapsed}
      isSelectable={false}
      toggleCollapsed={() =>
        setCollapsedSheetItem(!leaf.isCollapsed, {
          sheetAddress: leaf.sheetAddress,
          sheetItemKey: leaf.sheetItemKey,
        })
      }
    >
      {leaf.children.map((child) => decideLeftSheetChildRow(child, layoutP))}
    </AnyCompositeRow>
  )
}

export default LeftObjectNamespaceRow
