import type {GsapVarDisplayRow} from '@unseenco/backstage-shared/gsap/introspectGsapTweenDetails'
import React from 'react'
import styled from 'styled-components'

const List = styled.dl`
  margin: 0;
  padding: 0 8px 4px;
  display: grid;
  grid-template-columns: minmax(0, 38%) minmax(0, 1fr);
  gap: 2px 8px;
  font-size: 11px;
  line-height: 1.35;
`

const Key = styled.dt`
  margin: 0;
  color: #8a8a8a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Value = styled.dd`
  margin: 0;
  color: #d4d4d4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
`

const GsapVarsList: React.VFC<{rows: GsapVarDisplayRow[]}> = ({rows}) => {
  if (rows.length === 0) {
    return (
      <List>
        <Key>—</Key>
        <Value>(empty)</Value>
      </List>
    )
  }
  return (
    <List>
      {rows.map((row) => (
        <React.Fragment key={row.key}>
          <Key title={row.key}>{row.key}</Key>
          <Value title={row.displayValue}>{row.displayValue}</Value>
        </React.Fragment>
      ))}
    </List>
  )
}

export default GsapVarsList
