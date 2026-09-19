import {useVal} from '@unseenco/theatre-react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import Left from './Left/Left'
import DopeSheetBackground from './Right/DopeSheetBackground'
import Right from './Right/Right'
import VerticalScrollContainer from '@unseenco/theatre-studio/panels/SequenceEditorPanel/VerticalScrollContainer'
import {SequenceEditorPaneLayoutProvider} from './SequenceEditorPaneLayoutContext'
import {DOCKED_PANE_BACKGROUND} from '@unseenco/theatre-studio/UIRoot/dockedLayoutConstants'
import {SEQUENCE_EDITOR_DOCKED_SPLIT_GUTTER_WIDTH_PX} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/sequenceEditorLayoutConstants'

const Container = styled.div`
  position: absolute;
  left: 0;
  right: 0;
`

/** Covers sub-pixel bleed from left-head controls and early timeline keyframes at the split. */
const DockedSplitGutter = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: ${SEQUENCE_EDITOR_DOCKED_SPLIT_GUTTER_WIDTH_PX}px;
  margin-left: ${-SEQUENCE_EDITOR_DOCKED_SPLIT_GUTTER_WIDTH_PX + 1}px;
  z-index: 2;
  pointer-events: none;
  background: ${DOCKED_PANE_BACKGROUND};
`

const DopeSheet: React.VFC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  isDocked: boolean
}> = ({layoutP, isDocked}) => {
  const height = useVal(layoutP.dopeSheetDims.height)
  const leftWidth = useVal(layoutP.leftDims.width)

  return (
    <Container style={{height: height + 'px'}}>
      <DopeSheetBackground layoutP={layoutP} />
      <SequenceEditorPaneLayoutProvider isDocked={isDocked}>
        <VerticalScrollContainer>
          <Left layoutP={layoutP} />
          <Right layoutP={layoutP} />
        </VerticalScrollContainer>
        {isDocked && (
          <DockedSplitGutter style={{left: `${leftWidth}px`}} />
        )}
      </SequenceEditorPaneLayoutProvider>
    </Container>
  )
}

export default DopeSheet
