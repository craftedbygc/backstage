import type {GsapTargetDescriptor} from '@unseenco/theatre-shared/gsap/introspectGsapTweenDetails'
import React from 'react'
import styled from 'styled-components'
import GsapTargetPill from './GsapTargetPill'

const Row = styled.dl`
  margin: 0;
  padding: 2px 8px 6px;
  display: grid;
  grid-template-columns: minmax(0, 38%) minmax(0, 1fr);
  gap: 2px 8px;
  align-items: start;
  font-size: 11px;
  line-height: 1.35;
`

const RowKey = styled.dt`
  margin: 0;
  color: #8a8a8a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const PillsCell = styled.dd`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
`

const EmptyValue = styled.span`
  color: #777;
  font-size: 10px;
`

const GsapInlineTargetRow: React.VFC<{
  label: 'targets' | 'trigger'
  targets: GsapTargetDescriptor[]
}> = ({label, targets}) => {
  return (
    <Row>
      <RowKey>{label}</RowKey>
      <PillsCell>
        {targets.length === 0 ? (
          <EmptyValue>(none)</EmptyValue>
        ) : (
          targets.map((target, index) => (
            <GsapTargetPill
              key={`${target.kind}-${target.label}-${index}`}
              target={target}
            />
          ))
        )}
      </PillsCell>
    </Row>
  )
}

export default GsapInlineTargetRow
