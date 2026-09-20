import type {SequenceEditorTree_ObjectNamespace} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import {decideLeftSheetChildRow} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'

const LeftObjectNamespaceRow: React.VFC<{
  leaf: SequenceEditorTree_ObjectNamespace
}> = ({leaf}) => {
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
      {leaf.children.map((child) => decideLeftSheetChildRow(child))}
    </AnyCompositeRow>
  )
}

export default LeftObjectNamespaceRow
