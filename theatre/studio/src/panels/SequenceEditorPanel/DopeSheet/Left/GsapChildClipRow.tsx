import type {SequenceEditorTree_GsapChildClip} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import styled from 'styled-components'
import {BaseHeader, LeftRowContainer} from './AnyCompositeRow'
import {propNameTextCSS} from '@unseenco/theatre-studio/propEditors/utils/propNameTextCSS'
import {renderGsapListLabel} from '@unseenco/theatre-studio/gsap/GsapKindBadge'

const Label = styled.span`
  ${propNameTextCSS};
  color: #8a8a8a;
  font-size: 11px;
`

const Header = styled(BaseHeader)`
  padding-left: calc(0px + var(--depth) * 20px);
  display: flex;
  align-items: center;
  box-sizing: border-box;
`

const GsapChildClipLeftRow: React.VFC<{
  leaf: SequenceEditorTree_GsapChildClip
}> = ({leaf}) => {
  if (!leaf.shouldRender) return null

  return (
    <LeftRowContainer depth={leaf.depth}>
      <Header
        isEven={leaf.n % 2 === 0}
        style={{height: leaf.nodeHeight + 'px'}}
      >
        <Label title={leaf.childId}>
          {renderGsapListLabel('TW', leaf.displayLabel)}
        </Label>
      </Header>
    </LeftRowContainer>
  )
}

export default GsapChildClipLeftRow
