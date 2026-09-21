import type {SequenceEditorTree_GsapScrollTriggerChild} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import React, {useState} from 'react'
import styled from 'styled-components'
import {BaseHeader, LeftRowContainer} from './AnyCompositeRow'
import {propNameTextCSS} from '@unseenco/backstage/studio/propEditors/utils/propNameTextCSS'
import {renderGsapListLabel} from '@unseenco/backstage/studio/gsap/GsapKindBadge'
import {useGsapSequencerRowElementHighlight} from '@unseenco/backstage/studio/gsap/useGsapSequencerRowElementHighlight'
import {
  sequencerLeftHierarchyBranchBeforeCss,
  sequencerLeftLabelAlignedPaddingLeftPx,
} from './sequencerLeftPanelLayout'

const Label = styled.span`
  ${propNameTextCSS};
  color: #8a8a8a;
  font-size: 11px;
`

const Header = styled(BaseHeader)<{$depth: number}>`
  padding-left: ${(props) =>
    sequencerLeftLabelAlignedPaddingLeftPx(props.$depth)}px;
  position: relative;
  ${(props) => sequencerLeftHierarchyBranchBeforeCss(props.$depth)}
  display: flex;
  align-items: center;
  box-sizing: border-box;
`

const GsapScrollTriggerChildLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerChild
}> = ({leaf}) => {
  if (!leaf.shouldRender) return null

  const [headerEl, setHeaderEl] = useState<HTMLDivElement | null>(null)
  useGsapSequencerRowElementHighlight(headerEl, leaf)

  return (
    <LeftRowContainer depth={leaf.depth}>
      <Header
        ref={setHeaderEl}
        isEven={leaf.n % 2 === 0}
        $depth={leaf.depth}
        style={{height: leaf.nodeHeight + 'px'}}
      >
        <Label title={leaf.childId}>
          {renderGsapListLabel('TW', leaf.displayLabel)}
        </Label>
      </Header>
    </LeftRowContainer>
  )
}

export default GsapScrollTriggerChildLeftRow
