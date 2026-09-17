import * as React from 'react'
import UnsavedChangesDot from '@unseenco/theatre-studio/uiComponents/UnsavedChangesDot'
import styled from 'styled-components'

const IconWrap = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  line-height: 0;
`

const BadgeAnchor = styled.span`
  position: absolute;
  right: -2px;
  top: -2px;
`

/**
 * Default outline leaf icon: filled square (sheet object). Orange dot when diverged
 * from saved project state.
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
        <rect x={4.5} y={4.5} width={7} height={7} rx={1} fill="currentColor" />
      </svg>
      {unsaved ? (
        <BadgeAnchor>
          <UnsavedChangesDot />
        </BadgeAnchor>
      ) : null}
    </IconWrap>
  )
}

export default ObjectListObjectIcon
