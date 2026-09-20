import type {GsapTweenDetailsBlock} from '@unseenco/backstage-shared/gsap/introspectGsapTweenDetails'
import React from 'react'
import styled from 'styled-components'
import GsapInlineTargetRow from './GsapInlineTargetRow'
import GsapVarsList from './GsapVarsList'

const Block = styled.fieldset`
  margin: 8px 6px 4px;
  padding: 4px 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--studio-radius);
  min-width: 0;
`

const Legend = styled.legend`
  margin-left: 8px;
  padding: 0 6px;
  font-size: 10px;
  color: #a9a9a9;
`

const SubHeading = styled.div`
  padding: 4px 8px 2px;
  font-size: 10px;
  color: #8a8a8a;
  letter-spacing: 0.02em;
`

const GsapTweenBlockSection: React.VFC<{block: GsapTweenDetailsBlock}> = ({
  block,
}) => {
  return (
    <Block>
      <Legend>{block.name}</Legend>
      <GsapInlineTargetRow label="targets" targets={block.targets} />
      <SubHeading>vars</SubHeading>
      <GsapVarsList rows={block.vars} />
    </Block>
  )
}

export default GsapTweenBlockSection
