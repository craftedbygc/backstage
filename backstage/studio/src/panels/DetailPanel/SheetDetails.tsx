import React from 'react'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {Pointer} from '@unseenco/backstage/dataverse'
import type {$FixMe} from '@unseenco/backstage-shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'
import {useVal} from '@unseenco/backstage/react'
import uniqueKeyForAnyObject from '@unseenco/backstage-shared/utils/uniqueKeyForAnyObject'

const SheetDetails: React.FC<{
  sheetPropsObject: SheetObject
}> = ({sheetPropsObject}) => {
  const config = useVal(sheetPropsObject.template.configPointer)

  return (
    <DeterminePropEditorForDetail
      key={uniqueKeyForAnyObject(sheetPropsObject)}
      obj={sheetPropsObject}
      pointerToProp={sheetPropsObject.propsP as Pointer<$FixMe>}
      propConfig={config}
      visualIndentation={1}
    />
  )
}

export default SheetDetails
