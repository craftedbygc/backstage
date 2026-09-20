import {theme} from '@unseenco/backstage/studio/css'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {useVal} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {darken, transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'
import FrameGrid from '@unseenco/backstage/studio/panels/SequenceEditorPanel/FrameGrid/FrameGrid'

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: ${() => zIndexes.rightBackground};
  overflow: hidden;
  background: ${transparentize(0.01, darken(1 * 0.03, theme.panel.bg))};
  pointer-events: none;
`

const DopeSheetBackground: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const width = useVal(layoutP.rightDims.width)
  const leftWidth = useVal(layoutP.leftDims.width)
  const height = useVal(layoutP.panelDims.height)

  return (
    <Container style={{left: leftWidth + 'px'}}>
      <FrameGrid width={width} height={height} layoutP={layoutP} />
    </Container>
  )
}

export default DopeSheetBackground
