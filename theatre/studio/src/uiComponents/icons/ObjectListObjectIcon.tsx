import * as React from 'react'
import styled from 'styled-components'

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  line-height: 0;
`

const UNSAVED_FILL = '#f59e0b'

/**
 * Outline leaf icon: filled circle — white when clean, orange when diverged from
 * saved project state.
 */
function ObjectListObjectIcon(props: {unsaved?: boolean}) {
  const {unsaved = false} = props
  return (
    <IconWrap aria-hidden>
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={8}
          cy={8}
          r={2.5}
          fill={unsaved ? UNSAVED_FILL : '#ffffff'}
        />
      </svg>
    </IconWrap>
  )
}

export default ObjectListObjectIcon
