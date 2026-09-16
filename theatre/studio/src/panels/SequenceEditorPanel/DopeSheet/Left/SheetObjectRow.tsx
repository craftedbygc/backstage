import type {SequenceEditorTree_SheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import AnyCompositeRow from './AnyCompositeRow'
import {decideSheetObjectChildRow} from './PropWithChildrenRow'
import {setCollapsedSheetItem} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/setCollapsedSheetObjectOrCompoundProp'
import getStudio from '@unseenco/theatre-studio/getStudio'

const LeftSheetObjectRow: React.VFC<{
  leaf: SequenceEditorTree_SheetObject
}> = ({leaf}) => {
  return (
    <AnyCompositeRow
      leaf={leaf}
      label={leaf.displayLabel ?? leaf.sheetObject.address.objectKey}
      isCollapsed={leaf.isCollapsed}
      toggleSelect={() => {
        // set selection to this sheet object on click
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
      {leaf.children.map((child) => decideSheetObjectChildRow(child))}
    </AnyCompositeRow>
  )
}

export default LeftSheetObjectRow
