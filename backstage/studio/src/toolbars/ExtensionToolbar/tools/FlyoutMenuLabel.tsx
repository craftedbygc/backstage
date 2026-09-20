import React from 'react'
import styled from 'styled-components'
import UnsavedChangesDot from '@unseenco/backstage/studio/uiComponents/UnsavedChangesDot'

const LabelWrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const TriggerLabelWrap = styled(LabelWrap)`
  padding-right: 2px;
`

const FlyoutMenuLabel: React.FC<{
  text: string
  showUnsavedIndicator?: boolean
  variant?: 'trigger' | 'item'
}> = ({text, showUnsavedIndicator, variant = 'item'}) => {
  const Wrap = variant === 'trigger' ? TriggerLabelWrap : LabelWrap
  return (
    <Wrap>
      <span>{text}</span>
      {showUnsavedIndicator ? <UnsavedChangesDot /> : null}
    </Wrap>
  )
}

export default FlyoutMenuLabel
