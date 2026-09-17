import type {SequenceEditorTree_ObjectNamespace} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import {decideLeftSheetChildRow} from '../decideSheetChildRow'

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
