import React from 'react'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {Pointer} from '@unseenco/theatre-dataverse'
import type {$FixMe} from '@unseenco/theatre-shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'
import {useVal} from '@unseenco/theatre-react'
import uniqueKeyForAnyObject from '@unseenco/theatre-shared/utils/uniqueKeyForAnyObject'
import styled from 'styled-components'

const Section = styled.fieldset`
  margin: 4px 6px 8px;
  padding: 4px 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--studio-radius);
  min-width: 0;
`

const Legend = styled.legend`
  margin-left: 8px;
  padding: 0 6px;
  color: #a9a9a9;
  font-size: 10px;
  letter-spacing: 0.02em;
`

const SheetDetails: React.FC<{
  sheetPropsObject: SheetObject
  /** When true, show a "Sheet" legend above the prop rows. */
  showSectionHeader?: boolean
}> = ({sheetPropsObject, showSectionHeader = true}) => {
  const config = useVal(sheetPropsObject.template.configPointer)

  return (
    <Section>
      {showSectionHeader ? <Legend>Sheet</Legend> : null}
      <DeterminePropEditorForDetail
        key={uniqueKeyForAnyObject(sheetPropsObject)}
        obj={sheetPropsObject}
        pointerToProp={sheetPropsObject.propsP as Pointer<$FixMe>}
        propConfig={config}
        visualIndentation={1}
        hideRootHeader={!showSectionHeader}
      />
    </Section>
  )
}

export default SheetDetails
