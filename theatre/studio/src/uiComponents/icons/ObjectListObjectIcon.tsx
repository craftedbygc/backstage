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

/** Default outline leaf icon: filled square (sheet object). */
function ObjectListObjectIcon() {
  const size = 7 * 0.75
  const offset = (16 - size) / 2
  return (
    <IconWrap aria-hidden>
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={offset}
          y={offset}
          width={size}
          height={size}
          rx={0.75}
          fill="currentColor"
        />
      </svg>
    </IconWrap>
  )
}

export default ObjectListObjectIcon
