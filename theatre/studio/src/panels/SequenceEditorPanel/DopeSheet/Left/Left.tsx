import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import React from 'react'
import styled from 'styled-components'
import SheetRow from './SheetRow'
import {useSequenceEditorPaneLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/SequenceEditorPaneLayoutContext'

const Container = styled.div<{$clipHorizontalOverflow?: boolean}>`
  position: absolute;
  left: 0;
  box-sizing: border-box;
  overflow: ${(props) =>
    props.$clipHorizontalOverflow ? 'hidden' : 'visible'};
`

const ListContainer = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const Left: React.VFC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const {isDocked} = useSequenceEditorPaneLayout()

  return usePrism(() => {
    const tree = val(layoutP.tree)
    const width = val(layoutP.leftDims.width)

    return (
      <Container
        $clipHorizontalOverflow={isDocked}
        style={{width: width + 'px', top: tree.top + 'px'}}
      >
        <ListContainer>
          <SheetRow leaf={tree} />
        </ListContainer>
      </Container>
    )
  }, [layoutP, isDocked])
}

export default Left
