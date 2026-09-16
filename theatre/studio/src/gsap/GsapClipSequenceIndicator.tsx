import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import React from 'react'
import styled from 'styled-components'
import {transparentize} from 'polished'
import SavedStateDiamondWrapper from '@unseenco/theatre-studio/propEditors/SavedStateDiamondWrapper'
import {nextPrevCursorsTheme} from '@unseenco/theatre-studio/propEditors/NextPrevKeyframeCursors'
import {addGsapClipAtPlayhead} from './addGsapClipAtPlayhead'
import {getGsapObjectBinding} from '@unseenco/theatre-shared/gsap/gsapObjectBinding'

const Container = styled.div`
  width: 16px;
  margin: 0 0 0 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  line-height: 0;
  color: ${transparentize(0.8, `#C4C4C4`)};

  &:hover {
    color: ${transparentize(0.15, nextPrevCursorsTheme.onColor)};
  }
`

const GsapClipSequenceIndicator: React.FC<{sheetObject: SheetObject}> = ({
  sheetObject,
}) => {
  if (!getGsapObjectBinding(sheetObject)) return null

  return (
    <Container
      title="Add GSAP clip at playhead"
      onClick={() => {
        addGsapClipAtPlayhead(sheetObject)
      }}
    >
      <SavedStateDiamondWrapper
        hasDivergedFromSavedState={false}
        variant="filled"
        title="Add this GSAP animation to the sequence at the playhead"
      />
    </Container>
  )
}

export default GsapClipSequenceIndicator
