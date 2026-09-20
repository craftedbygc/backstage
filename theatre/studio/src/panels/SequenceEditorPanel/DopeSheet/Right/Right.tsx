import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import React from 'react'
import styled from 'styled-components'
import DopeSheetSelectionView from './DopeSheetSelectionView'
import HorizontallyScrollableArea from './HorizontallyScrollableArea'
import SheetRow from './SheetRow'
import {SEQUENCE_EDITOR_BOTTOM_SCROLL_SLACK_PX} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/sequenceEditorLayoutConstants'

export const contentWidth = 1000000

const ListContainer = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  left: 0;
  width: ${contentWidth}px;
`

const Right: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return usePrism(() => {
    const tree = val(layoutP.tree)
    const height =
      val(layoutP.tree.top) +
      // stretch the height of the dope sheet in case the rows don't cover its whole vertical space
      Math.max(
        val(layoutP.tree.heightIncludingChildren),
        val(layoutP.dopeSheetDims.height),
      ) +
      SEQUENCE_EDITOR_BOTTOM_SCROLL_SLACK_PX

    return (
      <>
        <HorizontallyScrollableArea layoutP={layoutP} height={height}>
          <DopeSheetSelectionView layoutP={layoutP} height={height}>
            <ListContainer style={{top: tree.top + 'px'}}>
              <SheetRow leaf={tree} layoutP={layoutP} />
            </ListContainer>
          </DopeSheetSelectionView>
        </HorizontallyScrollableArea>
      </>
    )
  }, [layoutP])
}

export default Right
