import type {SequenceEditorTree_GsapClipTrack} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import styled from 'styled-components'
import {BaseHeader, LeftRowContainer} from './AnyCompositeRow'
import {propNameTextCSS} from '@unseenco/theatre-studio/propEditors/utils/propNameTextCSS'

const Label = styled.span`
  ${propNameTextCSS};
  color: #9a9a9a;
`

const GsapClipTrackRow: React.VFC<{leaf: SequenceEditorTree_GsapClipTrack}> = ({
  leaf,
}) => {
  if (!leaf.shouldRender) return null

  return (
    <LeftRowContainer depth={leaf.depth}>
      <BaseHeader
        isEven={leaf.n % 2 === 0}
        style={{height: leaf.nodeHeight + 'px'}}
      >
        <Label title={leaf.trackData.gsapAnimationId}>GSAP clip</Label>
      </BaseHeader>
    </LeftRowContainer>
  )
}

export default GsapClipTrackRow
