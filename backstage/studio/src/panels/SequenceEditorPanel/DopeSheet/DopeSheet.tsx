import {useVal} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import Left from './Left/Left'
import DopeSheetBackground from './Right/DopeSheetBackground'
import Right from './Right/Right'
import VerticalScrollContainer from '@unseenco/backstage/studio/panels/SequenceEditorPanel/VerticalScrollContainer'
import {SequenceEditorPaneLayoutProvider} from './SequenceEditorPaneLayoutContext'

const Container = styled.div`
  position: absolute;
  left: 0;
  right: 0;
`

const DopeSheet: React.VFC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  isDocked: boolean
}> = ({layoutP, isDocked}) => {
  const height = useVal(layoutP.dopeSheetDims.height)

  return (
    <Container style={{height: height + 'px'}}>
      <DopeSheetBackground layoutP={layoutP} />
      <SequenceEditorPaneLayoutProvider isDocked={isDocked}>
        <VerticalScrollContainer>
          <Left layoutP={layoutP} />
          <Right layoutP={layoutP} />
        </VerticalScrollContainer>
      </SequenceEditorPaneLayoutProvider>
    </Container>
  )
}

export default DopeSheet
