import React from 'react'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {Pointer} from '@unseenco/theatre-dataverse'
import type {$FixMe} from '@unseenco/theatre-shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'
import {useVal} from '@unseenco/backstage/react'
import uniqueKeyForAnyObject from '@unseenco/theatre-shared/utils/uniqueKeyForAnyObject'

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
