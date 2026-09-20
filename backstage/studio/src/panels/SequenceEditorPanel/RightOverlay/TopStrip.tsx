import {useVal} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import React from 'react'
import styled from 'styled-components'
import useRefAndState from '@unseenco/backstage/studio/utils/useRefAndState'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import StampsGrid from '@unseenco/backstage/studio/panels/SequenceEditorPanel/FrameGrid/StampsGrid'
import {includeLockFrameStampAttrs} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {pointerEventsAutoInNormalMode} from '@unseenco/backstage/studio/css'
import FocusRangeZone from './FocusRangeZone/FocusRangeZone'
import {transportStripHeight} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/PlaybackControls/constants'
import {useDragPlayheadHandlers} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/useDragPlayheadHandlers'

export const topStripHeight = 18

export const topStripTheme = {
  backgroundColor: `#1f2120eb`,
  borderColor: `#1c1e21`,
}

const Container = styled.div`
  position: absolute;
  top: ${transportStripHeight}px;
  left: 0;
  right: 0;
  height: ${topStripHeight}px;
  box-sizing: border-box;
  background: ${topStripTheme.backgroundColor};
  border-bottom: 1px solid ${topStripTheme.borderColor};
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const TopStrip: React.FC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const width = useVal(layoutP.rightDims.width)
  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  useDragPlayheadHandlers(layoutP, containerNode)

  return (
    <>
      <Container ref={containerRef} {...includeLockFrameStampAttrs('hide')}>
        <StampsGrid layoutP={layoutP} width={width} height={topStripHeight} />
        <FocusRangeZone layoutP={layoutP} />
      </Container>
    </>
  )
}

export default TopStrip
