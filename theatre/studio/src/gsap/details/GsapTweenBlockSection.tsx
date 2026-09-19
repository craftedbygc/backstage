import type {GsapTweenDetailsBlock} from '@unseenco/theatre-shared/gsap/introspectGsapTweenDetails'
import React from 'react'
import styled from 'styled-components'
import GsapTargetPill from './GsapTargetPill'
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

const TargetRow = styled.div`
  padding: 2px 8px 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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
      <SubHeading>targets</SubHeading>
      <TargetRow>
        {block.targets.length === 0 ? (
          <span style={{fontSize: 10, color: '#777', paddingLeft: 4}}>
            (none)
          </span>
        ) : (
          block.targets.map((target, index) => (
            <GsapTargetPill
              key={`${target.kind}-${target.label}-${index}`}
              target={target}
            />
          ))
        )}
      </TargetRow>
      <SubHeading>vars</SubHeading>
      <GsapVarsList rows={block.vars} />
    </Block>
  )
}

export default GsapTweenBlockSection
