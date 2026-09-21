import type {SequenceEditorTree_Sheet} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {usePrism} from '@unseenco/backstage/react'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {setCollapsedSheetItem} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import {decideLeftSheetChildRow} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/decideSheetChildRow'

const SheetRow: React.VFC<{
  leaf: SequenceEditorTree_Sheet
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const childRows = leaf.children.map((child) =>
      decideLeftSheetChildRow(child, layoutP),
    )

    if (!leaf.shouldRender) {
      return <>{childRows}</>
    }

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
        {childRows}
      </AnyCompositeRow>
    )
  }, [leaf, layoutP])
}

export default SheetRow
