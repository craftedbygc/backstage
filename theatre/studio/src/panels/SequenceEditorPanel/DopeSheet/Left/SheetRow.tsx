import type {SequenceEditorTree_Sheet} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/backstage/react'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import {decideLeftSheetChildRow} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'

const SheetRow: React.VFC<{
  leaf: SequenceEditorTree_Sheet
}> = ({leaf}) => {
  return usePrism(() => {
    return (
      <AnyCompositeRow
        leaf={leaf}
        label={leaf.sheet.address.sheetId}
        isCollapsed={leaf.isCollapsed}
        toggleCollapsed={() => {
          setCollapsedSheetItem(!leaf.isCollapsed, {
            sheetAddress: leaf.sheet.address,
            sheetItemKey: leaf.sheetItemKey,
          })
        }}
      >
        {leaf.children.map((child) => decideLeftSheetChildRow(child))}
      </AnyCompositeRow>
    )
  }, [leaf])
}

export default SheetRow
