import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism} from '@unseenco/theatre-react'
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
  max-width: 100%;
  overflow: ${(props) =>
    props.$clipHorizontalOverflow ? 'hidden' : 'visible'};
  z-index: 1;
  contain: ${(props) => (props.$clipHorizontalOverflow ? 'paint' : 'none')};
`

const ListContainer = styled.ul<{$clipHorizontalOverflow?: boolean}>`
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: ${(props) =>
    props.$clipHorizontalOverflow ? 'hidden' : 'visible'};
  max-width: 100%;
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
        <ListContainer $clipHorizontalOverflow={isDocked}>
          <SheetRow leaf={tree} />
        </ListContainer>
      </Container>
    )
  }, [layoutP, isDocked])
}

export default Left
