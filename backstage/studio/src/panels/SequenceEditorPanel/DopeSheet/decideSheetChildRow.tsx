import type {SequenceEditorTree_SheetChild} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@unseenco/backstage/dataverse'
import React from 'react'
import LeftSheetObjectRow from './Left/SheetObjectRow'
import LeftObjectNamespaceRow from './Left/ObjectNamespaceRow'
import RightSheetObjectRow from './Right/SheetObjectRow'
import RightObjectNamespaceRow from './Right/ObjectNamespaceRow'
import uniqueKeyForAnyObject from '@unseenco/backstage-shared/utils/uniqueKeyForAnyObject'

export function decideLeftSheetChildRow(
  child: SequenceEditorTree_SheetChild,
): React.ReactElement {
  if (child.type === 'objectNamespace') {
    return (
      <LeftObjectNamespaceRow
        key={'objectNamespace-' + child.namespacePath.join('/')}
        leaf={child}
      />
    )
  }
  return (
    <LeftSheetObjectRow
      key={
        'sheetObject-' + uniqueKeyForAnyObject(child.sheetObject)
      }
      leaf={child}
    />
  )
}

export function decideRightSheetChildRow(
  child: SequenceEditorTree_SheetChild,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): React.ReactElement {
  if (child.type === 'objectNamespace') {
    return (
      <RightObjectNamespaceRow
        key={'objectNamespace-' + child.namespacePath.join('/')}
        layoutP={layoutP}
        leaf={child}
      />
    )
  }
  return (
    <RightSheetObjectRow
      layoutP={layoutP}
      key={'sheetObject-' + child.sheetObject.address.objectKey}
      leaf={child}
    />
  )
}
